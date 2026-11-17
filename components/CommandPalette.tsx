"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import { ArrowRight, Copy, FileText, FolderGit2, Hash, MessageSquareText, Search } from "lucide-react";
import { Github } from "@/components/icons";
import { sections, site } from "@/lib/site";
import { scrollToId, useChat } from "./chat/ChatProvider";

export const PALETTE_EVENT = "portfolio:palette";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { projects, ask, setOpen: setChatOpen } = useChat();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    setQuery("");
    fn();
  };

  const goSection = (id: string) => {
    if (pathname !== "/" || !scrollToId(id)) router.push(`/#${id}`);
  };

  const item =
    "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg";
  const group = "px-1 py-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-faint";

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      overlayClassName="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[15vh] z-[61] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
    >
      <div className="flex items-center gap-2 border-b border-line px-4">
        <Search size={15} className="text-faint" aria-hidden />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Type a command or search…"
          className="h-12 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
        />
        <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-faint">esc</kbd>
      </div>
      <Command.List className="max-h-[55vh] overflow-y-auto p-1">
        <Command.Empty className="px-4 py-6 text-center text-sm text-muted">
          No matches. Press Enter to ask the AI instead.
        </Command.Empty>

        <Command.Group heading="navigate" className={group}>
          {sections.map((s) => (
            <Command.Item key={s.id} value={`go ${s.label}`} className={item} onSelect={() => run(() => goSection(s.id))}>
              <Hash size={15} aria-hidden /> {s.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="projects" className={group}>
          {projects.map((p) => (
            <Command.Item
              key={p.slug}
              value={`project ${p.title} ${p.tags.join(" ")}`}
              className={item}
              onSelect={() => run(() => router.push(`/projects/${p.slug}`))}
            >
              <FolderGit2 size={15} aria-hidden />
              <span className="truncate">{p.title}</span>
              <ArrowRight size={13} className="ml-auto opacity-50" aria-hidden />
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="actions" className={group}>
          <Command.Item value="chat open ai assistant" className={item} onSelect={() => run(() => setChatOpen(true))}>
            <MessageSquareText size={15} aria-hidden /> Open AI chat
          </Command.Item>
          <Command.Item value="github profile" className={item} onSelect={() => run(() => window.open(site.github, "_blank"))}>
            <Github size={15} aria-hidden /> Open GitHub
          </Command.Item>
          {site.email && (
            <Command.Item value="copy email" className={item} onSelect={() => run(() => navigator.clipboard?.writeText(site.email))}>
              <Copy size={15} aria-hidden /> Copy email
            </Command.Item>
          )}
          {site.resume && (
            <Command.Item value="resume cv download" className={item} onSelect={() => run(() => window.open(site.resume, "_blank"))}>
              <FileText size={15} aria-hidden /> Open resume
            </Command.Item>
          )}
        </Command.Group>

        {query.trim() && (
          <Command.Group heading="ai" className={group} forceMount>
            <Command.Item value={`ask ${query}`} className={item} onSelect={() => run(() => ask(query))} forceMount>
              <MessageSquareText size={15} className="text-accent" aria-hidden />
              Ask the AI: <span className="truncate text-fg">&ldquo;{query}&rdquo;</span>
            </Command.Item>
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
