"use client";

import { MessageSquareText } from "lucide-react";
import { useChat } from "./ChatProvider";

export function AskAboutButton({ title, className = "" }: { title: string; className?: string }) {
  const { ask } = useChat();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        ask(`Tell me about ${title}: what problem does it solve, and what was technically interesting?`);
      }}
      className={`relative z-10 inline-flex items-center gap-1.5 font-mono text-sm text-muted hover:text-accent ${className}`}
    >
      <MessageSquareText size={14} aria-hidden /> ask ai
    </button>
  );
}
