// Client for /api/chat, shared by the chat widget and the hero terminal.
import type { ChatAction, ChatStreamEvent } from "./types";

export type ChatTurn = { role: "user" | "assistant"; content: string };

type Handlers = {
  signal?: AbortSignal;
  onText: (text: string) => void;
  onAction: (action: ChatAction) => void;
  onError: (message: string) => void;
};

// Sends the conversation and streams the reply. Throws AbortError if the signal is aborted.
export async function streamChat(messages: ChatTurn[], { signal, onText, onAction, onError }: Handlers): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    onError("Couldn't reach the chatbot. Check your connection and try again.");
    return;
  }
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    onError(data.error ?? "Something went wrong.");
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
      if (event.t === "text") onText(event.v);
      else if (event.t === "error") onError(event.v);
      else if (event.t === "action") onAction({ name: event.name, args: event.args });
    }
  }
}
