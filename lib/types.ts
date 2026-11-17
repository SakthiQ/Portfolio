export type ProjectSummary = {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  featured: boolean;
  order: number;
  status: string;
  stack: string[];
  tags: string[];
  github?: string;
  demo?: string;
  highlights: string[];
};

export type Project = ProjectSummary & { body: string };

export type ChatRole = "user" | "assistant";

export type ChatAction = { name: string; args: Record<string, unknown> };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  actions?: ChatAction[];
  error?: boolean;
};

// One line of the NDJSON stream sent by /api/chat.
export type ChatStreamEvent =
  | { t: "text"; v: string }
  | { t: "action"; name: string; args: Record<string, unknown> }
  | { t: "error"; v: string };
