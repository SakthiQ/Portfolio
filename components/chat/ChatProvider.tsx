"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ChatAction, ChatMessage, ChatStreamEvent, ProjectSummary } from "@/lib/types";

type ChatContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  messages: ChatMessage[];
  streaming: boolean;
  send: (text: string) => Promise<void>;
  ask: (text: string) => void; // open the widget and send
  reset: () => void;
  stop: () => void;
  projects: ProjectSummary[];
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const FILTER_EVENT = "portfolio:filter";

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  return true;
}

export function ChatProvider({ children, projects }: { children: ReactNode; projects: ProjectSummary[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;
  const router = useRouter();
  const pathname = usePathname();

  const runAction = useCallback(
    (action: ChatAction) => {
      const onHome = pathname === "/";
      switch (action.name) {
        case "open_project": {
          const slug = String(action.args.slug ?? "");
          if (projects.some((p) => p.slug === slug)) router.push(`/projects/${slug}`);
          break;
        }
        case "filter_projects": {
          const tag = String(action.args.tag ?? "");
          if (onHome) {
            window.dispatchEvent(new CustomEvent(FILTER_EVENT, { detail: tag }));
            scrollToId("projects");
          } else {
            router.push(`/?tag=${encodeURIComponent(tag)}#projects`);
          }
          break;
        }
        case "scroll_to_section": {
          const section = String(action.args.section ?? "");
          if (!onHome || !scrollToId(section)) router.push(`/#${section}`);
          break;
        }
        case "show_contact":
          // Rendered as a contact card inside the chat (see ChatPanel).
          break;
      }
    },
    [pathname, projects, router],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || streaming) return;
      const userMsg: ChatMessage = { id: uid(), role: "user", content };
      const botId = uid();
      const history = [...messagesRef.current.filter((m) => !m.error), userMsg];
      setMessages((prev) => [...prev, userMsg, { id: botId, role: "assistant", content: "" }]);
      setStreaming(true);

      const update = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === botId ? fn(m) : m)));

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          update((m) => ({ ...m, content: data.error ?? "Something went wrong.", error: true }));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            let event: ChatStreamEvent;
            try {
              event = JSON.parse(line);
            } catch {
              continue;
            }
            if (event.t === "text") update((m) => ({ ...m, content: m.content + event.v }));
            else if (event.t === "error") update((m) => ({ ...m, content: m.content || event.v, error: !m.content }));
            else if (event.t === "action") {
              const action = { name: event.name, args: event.args };
              update((m) => ({ ...m, actions: [...(m.actions ?? []), action] }));
              runAction(action);
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          update((m) => ({ ...m, content: "Couldn't reach the chatbot. Check your connection and try again.", error: true }));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [runAction, streaming],
  );

  const ask = useCallback(
    (text: string) => {
      setOpen(true);
      void send(text);
    },
    [send],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{ open, setOpen, messages, streaming, send, ask, reset, stop, projects }}>
      {children}
    </ChatContext.Provider>
  );
}
