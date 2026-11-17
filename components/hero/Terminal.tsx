"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { scrollToId, useChat } from "../chat/ChatProvider";
import { site, skills } from "@/lib/site";

type Line = { kind: "cmd" | "out"; text: ReactNode };

const PROMPT = (
  <span className="select-none">
    <span className="text-accent">{site.handle}</span>
    <span className="text-faint">@portfolio</span> <span className="text-cyan">~</span>
    <span className="text-faint"> $ </span>
  </span>
);

export function Terminal() {
  const { projects, ask } = useChat();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const featured = projects.filter((p) => p.featured);

  // Intro script, typed out once.
  useEffect(() => {
    const script: { cmd: string; out: ReactNode[] }[] = [
      { cmd: "whoami", out: [<span key="w"><span className="text-fg">{site.name}</span> · {site.role}</span>] },
      {
        cmd: "cat focus.txt",
        out: [
          <span key="1"><span className="text-accent">→</span> secure, grounded AI: RAG that checks its own answers</span>,
          <span key="2"><span className="text-accent">→</span> reliable backends: locks, outboxes, idempotency</span>,
        ],
      },
      {
        cmd: "ls projects/ --featured",
        out: [<span key="l" className="text-cyan">{featured.map((p) => p.slug + "/").join("  ")}</span>],
      },
    ];
    if (reduce) {
      setLines(script.flatMap((s) => [{ kind: "cmd" as const, text: s.cmd }, ...s.out.map((o) => ({ kind: "out" as const, text: o }))]));
      setLines((l) => [...l, { kind: "out", text: <span className="text-faint">type <span className="text-fg">help</span>, or ask me anything.</span> }]);
      setReady(true);
      return;
    }
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(400);
      for (const step of script) {
        for (let i = 1; i <= step.cmd.length; i++) {
          if (cancelled) return;
          setTyping(step.cmd.slice(0, i));
          await sleep(38 + Math.random() * 40);
        }
        await sleep(180);
        if (cancelled) return;
        setTyping("");
        setLines((l) => [...l, { kind: "cmd", text: step.cmd }, ...step.out.map((o) => ({ kind: "out" as const, text: o }))]);
        await sleep(350);
      }
      if (cancelled) return;
      setLines((l) => [...l, { kind: "out", text: <span className="text-faint">type <span className="text-fg">help</span>, or ask me anything.</span> }]);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines, typing]);

  const print = (...out: ReactNode[]) => setLines((l) => [...l, ...out.map((o) => ({ kind: "out" as const, text: o }))]);

  const goSection = (id: string) => scrollToId(id);

  const exec = (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { kind: "cmd", text: cmd }]);
    if (!cmd) return;
    const [name, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");
    switch (name.toLowerCase()) {
      case "help":
        print(
          <span key="h" className="text-muted">
            commands: <span className="text-fg">about</span>, <span className="text-fg">projects</span>, <span className="text-fg">open &lt;name&gt;</span>,{" "}
            <span className="text-fg">skills</span>, <span className="text-fg">contact</span>, <span className="text-fg">github</span>,{" "}
            <span className="text-fg">ask &lt;question&gt;</span>, <span className="text-fg">clear</span>
          </span>,
        );
        break;
      case "about":
        print(<span key="a">{site.tagline}</span>);
        goSection("about");
        break;
      case "projects":
      case "ls":
        print(...projects.map((p) => <span key={p.slug}><span className="text-cyan">{p.slug}</span> <span className="text-faint">· {p.tagline}</span></span>));
        break;
      case "open":
      case "cd": {
        const q = arg.toLowerCase().replace(/\/$/, "");
        const p = projects.find((x) => x.slug === q || x.title.toLowerCase().includes(q));
        if (q && p) {
          print(<span key="o" className="text-accent">opening {p.title}…</span>);
          router.push(`/projects/${p.slug}`);
        } else print(<span key="o" className="text-rose">no such project: {arg || "(empty)"}. try `projects`.</span>);
        break;
      }
      case "skills":
        print(...skills.map((g) => <span key={g.group}><span className="text-accent">{g.group.toLowerCase()}:</span> {g.items.join(", ")}</span>));
        break;
      case "contact":
        print(<span key="c">opening contact…</span>);
        goSection("contact");
        break;
      case "github":
        print(<span key="g">{site.github}</span>);
        window.open(site.github, "_blank", "noopener");
        break;
      case "clear":
        setLines([]);
        break;
      case "sudo":
        print(<span key="s" className="text-amber">nice try. this incident will be reported to the AI. 🙂</span>);
        break;
      case "ask":
        if (!arg) print(<span key="q" className="text-muted">usage: ask &lt;question&gt;</span>);
        else {
          print(<span key="q" className="text-accent">sending to the AI assistant…</span>);
          ask(arg);
        }
        break;
      default:
        if (rest.length >= 1 || cmd.endsWith("?")) {
          print(<span key="d" className="text-accent">not a command, so I asked the AI assistant →</span>);
          ask(cmd);
        } else {
          print(<span key="d" className="text-rose">command not found: {name}. try `help`.</span>);
        }
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    exec(input);
    if (input.trim()) setHistory((h) => [input, ...h].slice(0, 30));
    setHistIdx(-1);
    setInput("");
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-line bg-surface/90 shadow-2xl shadow-black/50 backdrop-blur"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="size-3 rounded-full bg-rose/80" />
        <span className="size-3 rounded-full bg-amber/80" />
        <span className="size-3 rounded-full bg-accent/80" />
        <span className="ml-3 font-mono text-xs text-faint">{site.handle}@portfolio: ~</span>
      </div>
      <div ref={bodyRef} className="h-[300px] overflow-y-auto p-4 font-mono text-[13px] leading-relaxed text-muted sm:h-[320px]">
        {lines.map((l, i) => (
          <div key={i} className="break-words">
            {l.kind === "cmd" ? (
              <>
                {PROMPT}
                <span className="text-fg">{l.text}</span>
              </>
            ) : (
              l.text
            )}
          </div>
        ))}
        {!ready && (
          <div>
            {PROMPT}
            <span className="text-fg">{typing}</span>
            <span className="animate-blink text-accent">▍</span>
          </div>
        )}
        {ready && (
          <form onSubmit={onSubmit} className="flex">
            {PROMPT}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" && history.length) {
                  e.preventDefault();
                  const i = Math.min(histIdx + 1, history.length - 1);
                  setHistIdx(i);
                  setInput(history[i]);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const i = histIdx - 1;
                  setHistIdx(Math.max(i, -1));
                  setInput(i >= 0 ? history[i] : "");
                }
              }}
              aria-label="Terminal command"
              autoComplete="off"
              spellCheck={false}
              className="ml-1 min-w-0 flex-1 bg-transparent text-fg caret-accent outline-none"
            />
          </form>
        )}
      </div>
    </div>
  );
}
