"use client";

import type { ReactNode } from "react";
import { useChat } from "./ChatProvider";

export function OpenChatButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { setOpen } = useChat();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-sm font-medium text-bg transition hover:brightness-110 ${className}`}
    >
      {children}
    </button>
  );
}
