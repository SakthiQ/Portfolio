import { GoogleGenAI, type Content, type GenerateContentResponse } from "@google/genai";
import { buildSystemPrompt } from "@/lib/knowledge";
import { buildToolDeclarations, TOOL_NAMES } from "@/lib/chatTools";
import { getAllTags, getProjects } from "@/lib/content";
import { rateLimit } from "@/lib/rateLimit";
import { sections, site } from "@/lib/site";
import type { ChatStreamEvent, Project } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY = 12;
const MAX_MSG_CHARS = 2_000;
const MAX_LAST_CHARS = 6_000; // room for a pasted job description
const FIRST_CHUNK_MS = 7_000; // a model that hasn't started answering by now is skipped for the next one
const TOTAL_MS = 45_000; // hard cap for one model's whole answer
const COOLDOWN_MS = 5 * 60_000; // after a model fails, skip it for this long

// Shared across requests on this server instance: model -> time it may be tried again.
const cooldownUntil = new Map<string, number>();

type InMessage = { role: "user" | "assistant"; content: string };
type Call = { name: string; args: Record<string, unknown> };
type Attempt = {
  it: AsyncIterator<GenerateContentResponse>;
  first: IteratorResult<GenerateContentResponse>;
  finish: () => void;
};

function bad(status: number, message: string, headers: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers });
}

// Reply for a page action, written from the site's own data so no second model call is needed.
function confirmActions(calls: Call[], projects: Project[]): string {
  return calls
    .map((c) => {
      switch (c.name) {
        case "open_project": {
          const p = projects.find((x) => x.slug === c.args.slug);
          return p ? `I've opened **${p.title}** for you. ${p.tagline}` : "I've opened that project for you.";
        }
        case "filter_projects": {
          const tag = String(c.args.tag ?? "");
          const titles = projects.filter((p) => p.tags.includes(tag)).map((p) => `**${p.title}**`);
          return titles.length
            ? `I've filtered the projects to ${tag}: ${titles.join(", ")}.`
            : `I've filtered the projects to ${tag}.`;
        }
        case "scroll_to_section": {
          const s = sections.find((x) => x.id === c.args.section);
          return `I've taken you to the ${s?.label ?? "requested"} section.`;
        }
        case "show_contact":
          return `Here's how to reach ${site.name}:`;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return bad(429, `You're sending messages quickly. Try again in ${limit.retryAfter}s.`, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return bad(503, "The chatbot isn't configured yet (missing GEMINI_API_KEY).");

  let body: { messages?: InMessage[] };
  try {
    body = await req.json();
  } catch {
    return bad(400, "Invalid JSON.");
  }
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages = raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return bad(400, "The last message must be from the user.");
  }
  const last = messages[messages.length - 1];
  if (!last.content.trim()) return bad(400, "Empty message.");
  if (last.content.length > MAX_LAST_CHARS) return bad(413, "That message is too long.");

  // Gemini needs the conversation to start with a user turn.
  while (messages.length && messages[0].role !== "user") messages.shift();

  const contents: Content[] = messages.map((m, i) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: i === messages.length - 1 ? m.content : m.content.slice(0, MAX_MSG_CHARS) }],
  }));

  const projects = getProjects();
  const config = {
    systemInstruction: buildSystemPrompt(),
    tools: [{ functionDeclarations: buildToolDeclarations(projects.map((p) => p.slug), getAllTags()) }],
    temperature: 0.4,
    maxOutputTokens: 1_200,
  };

  // Free-tier models are often briefly overloaded (503), slow, or out of quota (429, counted per model),
  // so fall back through a list of models before giving up.
  const configured = [
    ...new Set(
      [
        process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
        ...(process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.1-flash-lite,gemini-3.8-flash,gemini-3.5-flash").split(","),
      ]
        .map((m) => m.trim())
        .filter(Boolean),
    ),
  ];
  // Models that recently failed go to the back of the line instead of being waited on again.
  const now = Date.now();
  const isCooling = (m: string) => (cooldownUntil.get(m) ?? 0) > now;
  const models = [...configured.filter((m) => !isCooling(m)), ...configured.filter(isCooling)];
  let modelIdx = 0;

  const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));
  // Overloaded, out of quota, retired (404), slow or hung models: move on to the next one.
  const retryable = (e: unknown) =>
    /\b(404|429|500|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|no longer available|abort|timed? ?out/i.test(
      errText(e),
    );
  const skipModel = (why: string) => {
    cooldownUntil.set(models[modelIdx], Date.now() + COOLDOWN_MS);
    console.warn(`[chat] ${models[modelIdx]} ${why}, trying the next model`);
  };

  const ai = new GoogleGenAI({ apiKey });

  // Start one model and wait for its first chunk, but only up to FIRST_CHUNK_MS.
  const startAttempt = async (model: string): Promise<Attempt> => {
    const ctrl = new AbortController();
    const totalTimer = setTimeout(() => ctrl.abort(new Error("timed out")), TOTAL_MS);
    const finish = () => {
      clearTimeout(totalTimer);
      ctrl.abort(); // closes the connection, which can otherwise linger after the answer ends
    };
    const started = (async () => {
      const response = await ai.models.generateContentStream({
        model,
        contents,
        config: { ...config, abortSignal: ctrl.signal },
      });
      const it = response[Symbol.asyncIterator]();
      return { it, first: await it.next() };
    })();
    let firstTimer: ReturnType<typeof setTimeout> | undefined;
    const tooSlow = new Promise<never>((_, reject) => {
      firstTimer = setTimeout(() => reject(new Error("timed out waiting for the first response")), FIRST_CHUNK_MS);
    });
    try {
      const { it, first } = await Promise.race([started, tooSlow]);
      return { it, first, finish };
    } catch (e) {
      finish();
      started.catch(() => {}); // the abandoned attempt will reject after the abort
      throw e;
    } finally {
      clearTimeout(firstTimer);
    }
  };

  const openAttempt = async (): Promise<Attempt> => {
    let lastErr: unknown = new Error("No Gemini model configured.");
    for (; modelIdx < models.length; modelIdx++) {
      try {
        return await startAttempt(models[modelIdx]);
      } catch (e) {
        lastErr = e;
        if (!retryable(e)) throw e;
        skipModel(/timed out/.test(errText(e)) ? "too slow" : "unavailable");
      }
    }
    throw lastErr;
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (e: ChatStreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {
          closed = true; // the visitor went away; stop writing
        }
      };
      try {
        let calls: Call[] = [];
        let wroteText = false;

        // One model call per message. If a model fails before any text reached the visitor, try the next one.
        while (true) {
          calls = [];
          const attempt = await openAttempt();
          try {
            let r = attempt.first;
            while (!r.done) {
              const candidate = r.value.candidates?.[0];
              for (const part of candidate?.content?.parts ?? []) {
                if (part.thought) continue;
                if (part.text) {
                  wroteText = true;
                  send({ t: "text", v: part.text });
                }
                if (part.functionCall?.name) {
                  calls.push({ name: part.functionCall.name, args: part.functionCall.args ?? {} });
                }
              }
              // Stop as soon as the model says it's done; the connection can linger long after.
              if (candidate?.finishReason || closed) break;
              r = await attempt.it.next();
            }
            attempt.finish();
            break;
          } catch (e) {
            attempt.finish();
            if (wroteText || !retryable(e) || modelIdx >= models.length - 1) throw e;
            skipModel("failed mid-answer");
            modelIdx++;
          }
        }

        // Page actions run in the browser. Confirm them straight away instead of asking the model again.
        const actions = calls.filter((c) => (TOOL_NAMES as readonly string[]).includes(c.name));
        for (const c of actions) send({ t: "action", name: c.name, args: c.args });
        if (!wroteText) {
          send({
            t: "text",
            v: actions.length ? confirmActions(actions, projects) : "Sorry, I couldn't come up with an answer. Try rephrasing?",
          });
        }
      } catch (err) {
        const msg = errText(err);
        console.error("[chat] Gemini error:", msg);
        const friendly = /429|quota|exhausted/i.test(msg)
          ? "The free AI quota is used up for now. Please try again later, or use the Contact section."
          : retryable(err)
            ? "The AI is very busy right now. Please try again in a minute."
            : "Something went wrong talking to the AI. Please try again.";
        send({ t: "error", v: friendly });
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            /* already closed by the client */
          }
        }
      }
    },
    cancel() {
      // The visitor closed the tab or pressed Stop. Nothing else to clean up.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
