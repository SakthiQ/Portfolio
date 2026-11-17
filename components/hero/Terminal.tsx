"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { scrollToId, useChat } from "../chat/ChatProvider";
import { site, skills } from "@/lib/site";
import { streamChat, type ChatTurn } from "@/lib/chatClient";
import type { ChatAction } from "@/lib/types";
import { HOME, buildFs, displayPath, resolve, type VDir, type VNode } from "./vfs";

type Line = { kind: "cmd"; text: string; path: string } | { kind: "out"; node: ReactNode };

const COMMANDS: Record<string, string> = {
  help: "list commands",
  ls: "list files (-a shows hidden, -l long format)",
  cd: "change folder (cd .., cd ~, cd -)",
  pwd: "print the current folder",
  cat: "print a file",
  tree: "show the folder tree",
  open: "open a project, the resume, or a link",
  echo: "print text ($USER, $HOME, $PWD work)",
  history: "show past commands",
  clear: "clear the screen (or Ctrl+L)",
  whoami: "who is this?",
  date: "current date and time",
  uname: "system info (-a for all)",
  neofetch: "system summary",
  man: "help for one command",
  ask: "ask the AI (or just type normally)",
  github: "open the GitHub profile",
  contact: "show contact details",
  exit: "leave the shell",
};
const READ_ONLY = ["rm", "mv", "cp", "mkdir", "rmdir", "touch", "chmod", "chown", "ln", "nano", "vi", "vim"];
const AI_MEMORY = 10; // past messages sent with each question, so follow-ups make sense

type LiveReply = { text: string; notes: ReactNode[]; error?: string };

// Renders an AI reply as plain terminal text: headings, bullets and links simplified.
function AiText({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  return (
    <>
      {lines.map((raw, i) => {
        const heading = /^\s*#{1,6}\s+/.test(raw);
        const line = raw
          .replace(/^\s*#{1,6}\s+/, "")
          .replace(/^(\s*)[-*•]\s+/, "$1  • ")
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/__(.+?)__/g, "$1")
          .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1$2")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1 ($2)");
        return (
          <span key={i} className={`block whitespace-pre-wrap ${heading ? "text-accent" : "text-fg"}`}>
            {line || " "}
          </span>
        );
      })}
    </>
  );
}

function Prompt({ path }: { path: string }) {
  return (
    <span className="select-none">
      <span className="text-accent">{site.handle}</span>
      <span className="text-faint">@portfolio</span> <span className="text-cyan">{path}</span>
      <span className="text-faint"> $ </span>
    </span>
  );
}

const err = (text: string) => <span className="text-rose">{text}</span>;
const faint = (text: ReactNode) => <span className="text-faint">{text}</span>;
const isDir = (n: VNode): n is VDir => n.kind === "dir";

export function Terminal() {
  const { projects, runAction } = useChat();
  const [aiHistory, setAiHistory] = useState<ChatTurn[]>([]);
  const [live, setLive] = useState<LiveReply | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const reduce = useReducedMotion();
  const root = useMemo(() => buildFs(projects), [projects]);
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]); // newest first
  const [histIdx, setHistIdx] = useState(-1);
  const [cwd, setCwd] = useState<string[]>(HOME);
  const [prevCwd, setPrevCwd] = useState<string[]>(HOME);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const here = displayPath(cwd);
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
    const hint: Line = {
      kind: "out",
      node: faint(<>type <span className="text-fg">help</span> for commands, or just type to chat with my AI.</>),
    };
    const toLines = (s: (typeof script)[number]): Line[] => [
      { kind: "cmd", text: s.cmd, path: "~" },
      ...s.out.map((node) => ({ kind: "out" as const, node })),
    ];
    if (reduce) {
      setLines([...script.flatMap(toLines), hint]);
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
        setLines((l) => [...l, ...toLines(step)]);
        await sleep(350);
      }
      if (cancelled) return;
      setLines((l) => [...l, hint]);
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

  const print = (...out: ReactNode[]) => setLines((l) => [...l, ...out.map((node) => ({ kind: "out" as const, node }))]);
  const printText = (texts: string[], className = "text-muted") =>
    print(
      ...texts.map((t, i) => (
        <span key={i} className={`whitespace-pre-wrap ${t.startsWith("# ") ? "text-accent" : className}`}>
          {t || " "}
        </span>
      )),
    );

  const listing = (node: VDir, showAll: boolean, long: boolean): ReactNode => {
    const entries = Object.entries(node.children)
      .filter(([name]) => showAll || !name.startsWith("."))
      .sort(([a], [b]) => a.localeCompare(b));
    const names: [string, boolean][] = [...(showAll ? ([[".", true], ["..", true]] as [string, boolean][]) : []), ...entries.map(([n, c]) => [n, isDir(c)] as [string, boolean])];
    if (long) {
      return (
        <span className="block">
          {names.map(([n, d]) => {
            const child = node.children[n];
            const size = child && !isDir(child) ? child.lines.join("\n").length : 4096;
            return (
              <span key={n} className="block whitespace-pre">
                {faint(`${d ? "drwxr-xr-x" : "-rw-r--r--"}  ${site.handle}  ${String(size).padStart(5)}  `)}
                <span className={d ? "text-cyan" : "text-fg"}>{d ? n + "/" : n}</span>
              </span>
            );
          })}
        </span>
      );
    }
    return (
      <span className="flex flex-wrap gap-x-4">
        {names.map(([n, d]) => (
          <span key={n} className={d ? "text-cyan" : "text-fg"}>
            {d ? n + "/" : n}
          </span>
        ))}
      </span>
    );
  };

  const treeLines = (node: VDir, prefix = ""): { lines: ReactNode[]; dirs: number; files: number } => {
    const out: ReactNode[] = [];
    let dirs = 0;
    let files = 0;
    const entries = Object.entries(node.children)
      .filter(([n]) => !n.startsWith("."))
      .sort(([a], [b]) => a.localeCompare(b));
    entries.forEach(([name, child], i) => {
      const lastOne = i === entries.length - 1;
      out.push(
        <span key={prefix + name} className="block whitespace-pre">
          {faint(prefix + (lastOne ? "└── " : "├── "))}
          <span className={isDir(child) ? "text-cyan" : "text-fg"}>{isDir(child) ? name + "/" : name}</span>
        </span>,
      );
      if (isDir(child)) {
        dirs++;
        const sub = treeLines(child, prefix + (lastOne ? "    " : "│   "));
        out.push(...sub.lines);
        dirs += sub.dirs;
        files += sub.files;
      } else files++;
    });
    return { lines: out, dirs, files };
  };

  const openProject = (slug: string) => {
    const p = projects.find((x) => x.slug === slug);
    if (!p) return false;
    print(<span className="text-accent">opening {p.title}…</span>);
    router.push(`/projects/${p.slug}`);
    return true;
  };

  const exec = (raw: string) => {
    const cmd = raw.trim();
    setLines((l) => [...l, { kind: "cmd", text: cmd, path: here }]);
    if (!cmd) return;
    const tokens = cmd.split(/\s+/);
    const name = tokens[0];
    const args = tokens.slice(1);
    const flags = args.filter((a) => a.startsWith("-") && a.length > 1).join("").replace(/-/g, "");
    const paths = args.filter((a) => !(a.startsWith("-") && a.length > 1));
    const key = name.toLowerCase();

    // A question is always for the AI, even if it starts with a command word ("open source projects?").
    if (cmd.endsWith("?")) {
      void runAi(cmd);
      return;
    }

    if (READ_ONLY.includes(key)) {
      const verb: Record<string, string> = { rm: "remove", rmdir: "remove", mkdir: "create directory", touch: "touch", mv: "move", cp: "copy" };
      const target = paths[0] ? `cannot ${verb[key] ?? "change"} '${paths[0]}': ` : "";
      print(err(`${key}: ${target}Read-only file system`));
      if (key.startsWith("vi")) print(faint("(tip: :q! — and try `cat` instead)"));
      return;
    }

    switch (key) {
      case "help":
        print(faint("portfolio bash · read-only. available commands:"));
        print(
          ...Object.entries(COMMANDS).map(([c, d]) => (
            <span key={c} className="block whitespace-pre">
              <span className="text-fg">{"  " + c.padEnd(10)}</span>
              {faint(d)}
            </span>
          )),
        );
        print(faint("anything else you type is sent to my AI. try: who are you? · best backend project? · hire you?"));
        return;
      case "ls": {
        const targets = paths.length ? paths : ["."];
        targets.forEach((t) => {
          const res = resolve(root, cwd, t);
          if (!res) return print(err(`ls: cannot access '${t}': No such file or directory`));
          if (targets.length > 1) print(<span className="text-fg">{t}:</span>);
          print(isDir(res.node) ? listing(res.node, flags.includes("a"), flags.includes("l")) : <span className="text-fg">{t}</span>);
        });
        return;
      }
      case "cd": {
        const t = paths[0] ?? "~";
        const target = t === "-" ? prevCwd : resolve(root, cwd, t)?.segs;
        const res = target ? resolve(root, [], "/" + target.join("/")) : null;
        if (!target || !res) return print(err(`bash: cd: ${t}: No such file or directory`));
        if (!isDir(res.node)) return print(err(`bash: cd: ${t}: Not a directory`));
        if (t === "-") print(<span className="text-muted">{displayPath(target)}</span>);
        setPrevCwd(cwd);
        setCwd(target);
        return;
      }
      case "pwd":
        print(<span className="text-muted">{"/" + cwd.join("/")}</span>);
        return;
      case "cat": {
        if (!paths.length) return print(err("cat: missing file operand"));
        paths.forEach((p) => {
          const res = resolve(root, cwd, p);
          if (!res) return print(err(`cat: ${p}: No such file or directory`));
          if (isDir(res.node)) return print(err(`cat: ${p}: Is a directory`));
          printText(res.node.lines);
        });
        return;
      }
      case "tree": {
        const t = paths[0] ?? ".";
        const res = resolve(root, cwd, t);
        if (!res || !isDir(res.node)) return print(err(`tree: ${t}: No such directory`));
        const tr = treeLines(res.node);
        print(<span className="text-cyan">{t}</span>, ...tr.lines, faint(`${tr.dirs} directories, ${tr.files} files`));
        return;
      }
      case "open": {
        const t = paths[0];
        if (t && /^https?:\/\//.test(t)) {
          print(<span className="text-accent">opening {t}…</span>);
          window.open(t, "_blank", "noopener");
          return;
        }
        const res = resolve(root, cwd, t ?? ".");
        const node = res?.node;
        if (node?.kind === "file" && node.href) {
          print(<span className="text-accent">opening {t}…</span>);
          window.open(node.href, "_blank", "noopener");
          return;
        }
        if (node?.project && openProject(node.project)) return;
        const byName = t && projects.find((p) => p.slug === t.replace(/\/$/, "") || p.title.toLowerCase().includes(t.toLowerCase()));
        if (byName) {
          openProject(byName.slug);
          return;
        }
        print(err(t ? `open: ${t}: No such project or file` : "usage: open <project | resume.pdf | url>  (or run it inside a project folder)"));
        return;
      }
      case "echo": {
        const vars: Record<string, string> = {
          USER: site.handle,
          HOME: "/" + HOME.join("/"),
          PWD: "/" + cwd.join("/"),
          SHELL: "/bin/bash",
          HOSTNAME: "portfolio",
        };
        const text = args
          .join(" ")
          .replace(/^["']|["']$/g, "")
          .replace(/\$\{?([A-Z]+)\}?/g, (_, v: string) => vars[v] ?? "");
        print(<span className="whitespace-pre-wrap text-muted">{text}</span>);
        return;
      }
      case "history":
        print(
          ...[...history].reverse().concat(cmd).map((h, i) => (
            <span key={i} className="block whitespace-pre">
              {faint(String(i + 1).padStart(4) + "  ")}
              <span className="text-muted">{h}</span>
            </span>
          )),
        );
        return;
      case "clear":
        setLines([]);
        return;
      case "whoami":
        print(<span><span className="text-fg">{site.name}</span> · {site.role}</span>);
        return;
      case "date":
        print(<span className="text-muted">{new Date().toString()}</span>);
        return;
      case "hostname":
        print(<span className="text-muted">portfolio</span>);
        return;
      case "uname":
        print(<span className="text-muted">{flags.includes("a") ? "Portfolio portfolio 1.0 Next.js-15 Vercel-Edge x86_64 GNU/Linux" : "Portfolio"}</span>);
        return;
      case "neofetch":
        printText(
          [
            `${site.handle}@portfolio`,
            "-".repeat(site.handle.length + 10),
            `Name:      ${site.fullName}`,
            `Role:      ${site.role}`,
            "OS:        Next.js 15 on Vercel",
            "Shell:     bash (portfolio edition, read-only)",
            "AI:        Google Gemini",
            `Projects:  ${projects.length}`,
            `Languages: ${skills.find((g) => g.group === "Languages")?.items.slice(0, 5).join(", ") ?? ""}`,
            `Education: ${site.education}`,
          ],
          "text-fg",
        );
        return;
      case "man": {
        const c = paths[0];
        if (!c) return print(err("What manual page do you want?"));
        if (!COMMANDS[c]) return print(err(`No manual entry for ${c}`));
        print(<span><span className="text-fg">{c}</span> {faint(`— ${COMMANDS[c]}`)}</span>);
        return;
      }
      case "ask":
        if (!args.length) return print(faint("usage: ask <question>  (or just type your question)"));
        void runAi(args.join(" "));
        return;
      case "github":
        print(<span className="text-muted">{site.github}</span>);
        window.open(site.github, "_blank", "noopener");
        return;
      case "contact": {
        const res = resolve(root, HOME, "~/contact.txt");
        if (res && !isDir(res.node)) printText(res.node.lines);
        scrollToId("contact");
        return;
      }
      case "about":
      case "skills": {
        const res = resolve(root, HOME, `~/${key}.txt`);
        if (res && !isDir(res.node)) printText(res.node.lines);
        return;
      }
      case "projects":
        print(
          ...projects.map((p) => (
            <span key={p.slug} className="block">
              <span className="text-cyan">{p.slug}/</span> {faint(`· ${p.tagline}`)}
            </span>
          )),
        );
        return;
      case "sudo":
        print(faint(`[sudo] password for ${site.handle}:`), err(`${site.handle} is not in the sudoers file. This incident will be reported.`));
        return;
      case "git":
        print(faint(`this shell is read-only. the real repo: ${site.github}/Portfolio`));
        return;
      case "exit":
      case "logout":
        print(<span className="text-muted">logout</span>, faint("…just kidding, you're still here. type `help`."));
        return;
    }

    // Not a command: it's a message for the AI.
    void runAi(cmd);
  };

  const actionNote = (a: ChatAction): ReactNode => {
    switch (a.name) {
      case "open_project": {
        const p = projects.find((x) => x.slug === a.args.slug);
        return faint(`↳ opening ${p?.title ?? a.args.slug}…`);
      }
      case "filter_projects":
        return faint(`↳ filtered the projects grid: ${a.args.tag}`);
      case "scroll_to_section":
        return faint(`↳ scrolled to ${a.args.section}`);
      case "show_contact": {
        const res = resolve(root, HOME, "~/contact.txt");
        return res && !isDir(res.node) ? (
          <span className="block">
            {res.node.lines.map((l) => (
              <span key={l} className="block whitespace-pre text-cyan">
                {l}
              </span>
            ))}
          </span>
        ) : null;
      }
      default:
        return null;
    }
  };

  // Send a message to the AI and stream the reply into the terminal.
  const runAi = async (question: string) => {
    if (live) return;
    const turns: ChatTurn[] = [...aiHistory, { role: "user" as const, content: question }].slice(-AI_MEMORY);
    const reply: LiveReply = { text: "", notes: [] };
    setLive({ ...reply });
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let stopped = false;
    try {
      await streamChat(turns, {
        signal: ctrl.signal,
        onText: (t) => {
          reply.text += t;
          setLive({ ...reply });
        },
        onAction: (a) => {
          reply.notes = [...reply.notes, actionNote(a)];
          setLive({ ...reply });
          if (a.name !== "show_contact") runAction(a);
        },
        onError: (msg) => {
          if (!reply.text) reply.error = msg;
          setLive({ ...reply });
        },
      });
    } catch {
      stopped = true; // Ctrl+C
    }
    abortRef.current = null;
    print(
      <span className="block">
        {reply.text && <AiText text={reply.text} />}
        {reply.notes.map((n, i) => (
          <span key={i} className="block">
            {n}
          </span>
        ))}
        {reply.error && err(reply.error)}
        {stopped && faint("^C")}
      </span>,
    );
    if (reply.text) setAiHistory([...turns, { role: "assistant" as const, content: reply.text }].slice(-AI_MEMORY));
    setLive(null);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  // Ctrl+C stops a reply while it's streaming (the input is hidden then, like a running program).
  useEffect(() => {
    if (!live) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
        e.preventDefault();
        abortRef.current?.abort();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live]);

  // Bash-style Tab completion for command names and paths.
  const complete = () => {
    const tokens = input.split(" ");
    const last = tokens[tokens.length - 1];
    let candidates: string[];
    let base = "";
    let partial = last;
    if (tokens.length === 1) {
      candidates = Object.keys(COMMANDS).filter((c) => c.startsWith(last));
    } else {
      const slash = last.lastIndexOf("/");
      base = slash >= 0 ? last.slice(0, slash + 1) : "";
      partial = last.slice(base.length);
      const res = resolve(root, cwd, base || ".");
      if (!res || !isDir(res.node)) return;
      const children = res.node.children;
      candidates = Object.keys(children)
        .filter((n) => n.startsWith(partial) && (partial.startsWith(".") || !n.startsWith(".")))
        .map((n) => (isDir(children[n]) ? n + "/" : n));
    }
    if (!candidates.length) return;
    const replaceLast = (value: string) => setInput([...tokens.slice(0, -1), value].join(" "));
    if (candidates.length === 1) {
      const c = candidates[0];
      replaceLast(base + c + (c.endsWith("/") ? "" : " "));
      return;
    }
    let prefix = candidates[0];
    for (const c of candidates) while (!c.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (prefix.length > partial.length) {
      replaceLast(base + prefix);
      return;
    }
    setLines((l) => [
      ...l,
      { kind: "cmd", text: input, path: here },
      {
        kind: "out",
        node: (
          <span className="flex flex-wrap gap-x-4">
            {candidates.map((c) => (
              <span key={c} className={c.endsWith("/") ? "text-cyan" : "text-fg"}>
                {c}
              </span>
            ))}
          </span>
        ),
      },
    ]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
      e.preventDefault();
      setLines((l) => [...l, { kind: "cmd", text: input + "^C", path: here }]);
      setInput("");
      setHistIdx(-1);
    } else if (e.key === "ArrowUp" && history.length) {
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
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    exec(input);
    if (input.trim()) setHistory((h) => [input.trim(), ...h].slice(0, 50));
    setHistIdx(-1);
    setInput("");
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-line bg-surface/90 shadow-2xl shadow-black/50 backdrop-blur"
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
      }}
    >
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="size-3 rounded-full bg-rose/80" />
        <span className="size-3 rounded-full bg-amber/80" />
        <span className="size-3 rounded-full bg-accent/80" />
        <span className="ml-3 font-mono text-xs text-faint">
          {site.handle}@portfolio: {here}
        </span>
      </div>
      <div ref={bodyRef} className="term-scroll h-[300px] overflow-y-auto p-4 font-mono text-[13px] leading-relaxed text-muted sm:h-[320px]">
        {lines.map((l, i) => (
          <div key={i} className="break-words">
            {l.kind === "cmd" ? (
              <>
                <Prompt path={l.path} />
                <span className="text-fg">{l.text}</span>
              </>
            ) : (
              l.node
            )}
          </div>
        ))}
        {!ready && (
          <div>
            <Prompt path="~" />
            <span className="text-fg">{typing}</span>
            <span className="animate-blink text-accent">▍</span>
          </div>
        )}
        {live && (
          <div aria-live="polite">
            {live.text ? <AiText text={live.text} /> : faint("thinking")}
            {live.notes.map((n, i) => (
              <span key={i} className="block">
                {n}
              </span>
            ))}
            {live.error && err(live.error)}
            <span className="animate-blink text-accent">▍</span>
          </div>
        )}
        {ready && !live && (
          <form onSubmit={onSubmit} className="flex">
            <Prompt path={here} />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal command"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="ml-1 min-w-0 flex-1 bg-transparent text-fg caret-accent outline-none term-input"
            />
          </form>
        )}
      </div>
    </div>
  );
}
