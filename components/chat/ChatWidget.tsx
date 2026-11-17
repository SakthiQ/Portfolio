"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { useChat } from "./ChatProvider";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  const { open, setOpen } = useChat();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  if (pathname === "/chat") return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Sakthi's AI assistant"
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-2 bottom-2 top-16 z-50 overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-2xl shadow-black/60 backdrop-blur sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(640px,calc(100vh-6rem))] sm:w-[420px]"
          >
            <ChatPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-surface px-4 py-3 font-mono text-sm text-fg shadow-lg shadow-accent/10 transition hover:border-accent hover:shadow-accent/25"
          aria-label="Open chat with Sakthi's AI assistant"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          <MessageSquareText size={16} className="text-accent" aria-hidden />
          <span className="hidden sm:inline">Ask Sakthi&apos;s AI</span>
        </button>
      )}
    </>
  );
}
