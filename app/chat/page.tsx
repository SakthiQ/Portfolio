import type { Metadata } from "next";
import { ChatPanel } from "@/components/chat/ChatPanel";

export const metadata: Metadata = {
  title: "Ask Sakthi's AI",
  description: "Chat with an AI assistant that knows Sakthi's projects, skills and background.",
};

export default function ChatPage() {
  return (
    <main className="mx-auto flex h-dvh max-w-3xl flex-col px-4 pb-4 pt-20">
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-surface">
        <ChatPanel variant="page" />
      </div>
    </main>
  );
}
