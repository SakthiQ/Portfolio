"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, Briefcase, Mail, Maximize2, RotateCcw, Square, X, Sparkles, CornerDownRight } from "lucide-react";
import { Github, Linkedin } from "@/components/icons";
import { useChat } from "./ChatProvider";
import { site } from "@/lib/site";
import type { ChatAction, ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "What's Sakthi's strongest backend project?",
  "Explain ATTS-RAG in simple terms",
  "What tech does Sakthi know?",
  "Show me the Java projects",
  "How do I contact Sakthi?",
];

function actionLabel(a: ChatAction, titles: Map<string, string>) {
  switch (a.name) {
    case "open_project":
      return `opened ${titles.get(String(a.args.slug)) ?? a.args.slug}`;
    case "filter_projects":
      return `filtered projects: ${a.args.tag}`;
    case "scroll_to_section":
      return `jumped to ${a.args.section}`;
    case "show_contact":
      return "contact details";
    default:
      return a.name;
  }
}

function ContactCard() {
  const links = [
    site.email && { href: `mailto:${site.email}`, label: site.email, Icon: Mail },
    site.linkedin && { href: site.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: site.github, label: "github.com/" + site.githubUser, Icon: Github },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[];
  return (
    <div className="mt-2 rounded-lg border border-line bg-bg/60 p-3 text-sm">
      <p className="mb-2 font-mono text-xs text-faint">{`// reach ${site.name.toLowerCase()}`}</p>
      <ul className="space-y-1.5">
        {links.map(({ href, label, Icon }) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-cyan hover:underline">
              <Icon size={14} aria-hidden /> {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Message({ m, last, streaming, titles }: { m: ChatMessage; last: boolean; streaming: boolean; titles: Map<string, string> }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-accent/15 px-3.5 py-2 text-sm text-fg">
          {m.content.length > 600 ? m.content.slice(0, 600) + "…" : m.content}
        </div>
      </div>
    );
  }
  const thinking = last && streaming && !m.content;
  return (
    <div className="flex gap-2.5">
      <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-line bg-surface-2 font-mono text-xs text-accent" aria-hidden>
        &gt;_
      </div>
      <div className="min-w-0 flex-1">
        {m.actions?.map((a, i) => (
          <p key={i} className="mb-1 inline-flex items-center gap-1 font-mono text-xs text-faint">
            <CornerDownRight size={12} aria-hidden /> {actionLabel(a, titles)}
          </p>
        ))}
        {thinking ? (
          <p className="font-mono text-sm text-muted">
            thinking<span className="animate-blink">_</span>
          </p>
        ) : (
          <div className={`prose-term prose-chat break-words ${m.error ? "text-rose" : ""}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{ a: (props) => <a {...props} target="_blank" rel="noreferrer" /> }}
            >
              {m.content}
            </ReactMarkdown>
            {last && streaming && <span className="animate-blink font-mono text-accent">▍</span>}
          </div>
        )}
        {m.actions?.some((a) => a.name === "show_contact") && <ContactCard />}
      </div>
    </div>
  );
}

export function ChatPanel({ variant = "widget" }: { variant?: "widget" | "page" }) {
  const { messages, streaming, send, reset, stop, setOpen, projects } = useChat();
  const [input, setInput] = useState("");
  const [recruiter, setRecruiter] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titles = new Map(projects.map((p) => [p.slug, p.title]));

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [recruiter]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    void send(
      recruiter
        ? `Here is a job description. How well does ${site.name} fit this role? Map requirements to evidence and be honest about gaps.\n\n---\n${text}`
        : text,
    );
    setInput("");
    setRecruiter(false);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="size-2 rounded-full bg-accent shadow-[0_0_10px] shadow-accent" aria-hidden />
        <h2 className="font-mono text-sm">
          ask-{site.handle}
          <span className="ml-2 text-faint">· AI, may make mistakes</span>
        </h2>
        <div className="ml-auto flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={reset} className="rounded p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="New conversation" title="New conversation">
              <RotateCcw size={15} />
            </button>
          )}
          {variant === "widget" && (
            <>
              <Link href="/chat" onClick={() => setOpen(false)} className="rounded p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Open full screen" title="Full screen">
                <Maximize2 size={15} />
              </Link>
              <button onClick={() => setOpen(false)} className="rounded p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close chat">
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-surface-2/50 p-4">
              <p className="flex items-center gap-2 font-mono text-sm text-accent">
                <Sparkles size={14} aria-hidden /> Hi! I&apos;m {site.name}&apos;s AI assistant.
              </p>
              <p className="mt-2 text-sm text-muted">
                Ask me about {site.name}&apos;s projects, skills or background. I can also open projects and move around the
                site for you. Hiring? Use <span className="text-fg">Recruiter mode</span> and paste a job description.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-left text-xs text-muted transition hover:border-accent/60 hover:text-fg"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <Message key={m.id} m={m} last={i === messages.length - 1} streaming={streaming} titles={titles} />
          ))
        )}
      </div>

      <form onSubmit={submit} className="border-t border-line p-3">
        {recruiter && (
          <p className="mb-2 flex items-center gap-1.5 font-mono text-xs text-amber">
            <Briefcase size={12} aria-hidden /> recruiter mode: paste a job description
          </p>
        )}
        <div className="flex items-end gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 focus-within:border-accent/60">
          <span className="pb-1 font-mono text-sm text-accent" aria-hidden>
            $
          </span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={recruiter ? 5 : 1}
            maxLength={recruiter ? 5500 : 1500}
            placeholder={recruiter ? "Paste the job description…" : "Ask anything about Sakthi…"}
            aria-label="Message"
            className="max-h-40 flex-1 resize-none bg-transparent py-0.5 text-sm text-fg outline-none placeholder:text-faint"
          />
          {streaming ? (
            <button type="button" onClick={stop} className="grid size-8 place-items-center rounded-lg bg-surface text-fg hover:bg-line" aria-label="Stop">
              <Square size={13} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="grid size-8 place-items-center rounded-lg bg-accent text-bg transition disabled:opacity-30"
              aria-label="Send"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setRecruiter((r) => !r)}
            aria-pressed={recruiter}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition ${
              recruiter ? "bg-amber/15 text-amber" : "text-faint hover:text-muted"
            }`}
          >
            <Briefcase size={12} aria-hidden /> Recruiter mode
          </button>
          <span className="font-mono text-[11px] text-faint">Enter to send · Shift+Enter for new line</span>
        </div>
      </form>
    </div>
  );
}
