import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { buildSystemPrompt } from "@/lib/knowledge";
import { buildToolDeclarations, TOOL_NAMES } from "@/lib/chatTools";
import { getAllTags, getProjects } from "@/lib/content";
import { rateLimit } from "@/lib/rateLimit";
import type { ChatStreamEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY = 12;
const MAX_MSG_CHARS = 2_000;
const MAX_LAST_CHARS = 6_000; // room for a pasted job description
const MAX_TOOL_ROUNDS = 2;
const MODEL_TIMEOUT_MS = 15_000; // a hung model request is abandoned and the next model is tried
const COOLDOWN_MS = 5 * 60_000; // after a model reports overload, skip it for this long

// Shared across requests on this server instance: model -> time it may be tried again.
const cooldownUntil = new Map<string, number>();

type InMessage = { role: "user" | "assistant"; content: string };

function bad(status: number, message: string, headers: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers });
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
  const slugs = projects.map((p) => p.slug);
  const config = {
    systemInstruction: buildSystemPrompt(),
    tools: [{ functionDeclarations: buildToolDeclarations(slugs, getAllTags()) }],
    temperature: 0.4,
    maxOutputTokens: 1_200,
  };
  // Free-tier models are often briefly overloaded (503) or out of quota (429, counted per model),
  // so fall back through a list of models before giving up.
  const configured = [
    ...new Set(
      [process.env.GEMINI_MODEL || "gemini-3.8-flash", ...(process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite").split(",")]
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
  // Overloaded, out of quota, retired (404) or hung models: move on to the next one.
  const retryable = (e: unknown) =>
    /\b(404|429|500|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|no longer available|abort|timed? ?out/i.test(errText(e));
  const ai = new GoogleGenAI({ apiKey });
  const openStream = async () => {
    let lastErr: unknown;
    for (; modelIdx < models.length; modelIdx++) {
      try {
        return await ai.models.generateContentStream({
          model: models[modelIdx],
          contents,
          config: { ...config, abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS) },
        });
      } catch (e) {
        lastErr = e;
        if (!retryable(e)) throw e;
        cooldownUntil.set(models[modelIdx], Date.now() + COOLDOWN_MS);
        console.warn(`[chat] ${models[modelIdx]} unavailable, trying the next model`);
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
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
          let modelParts: Part[] = [];
          let calls: { name: string; args: Record<string, unknown> }[] = [];
          let wroteText = false;

          // A model can also fail or hang mid-stream; if nothing reached the visitor yet, retry on the next model.
          while (true) {
            modelParts = [];
            calls = [];
            const response = await openStream();
            const started = Date.now();
            try {
              for await (const chunk of response) {
                const candidate = chunk.candidates?.[0];
                const parts = candidate?.content?.parts ?? [];
                for (const part of parts) {
                  modelParts.push(part);
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
                if (candidate?.finishReason || closed || Date.now() - started > MODEL_TIMEOUT_MS * 2) break;
              }
              break;
            } catch (e) {
              if (wroteText || !retryable(e) || modelIdx >= models.length - 1) throw e;
              cooldownUntil.set(models[modelIdx], Date.now() + COOLDOWN_MS);
              console.warn(`[chat] ${models[modelIdx]} failed mid-stream, trying the next model`);
              modelIdx++;
            }
          }

          if (!calls.length) {
            if (!wroteText && round === 0) send({ t: "text", v: "Sorry, I couldn't come up with an answer. Try rephrasing?" });
            break;
          }

          // Tools run in the browser; tell the model they succeeded so it can finish its reply.
          const responses: Part[] = [];
          for (const call of calls) {
            const valid = (TOOL_NAMES as readonly string[]).includes(call.name);
            if (valid) send({ t: "action", name: call.name, args: call.args });
            responses.push({
              functionResponse: {
                name: call.name,
                response: valid ? { result: "Done. The page was updated for the visitor." } : { error: "Unknown tool" },
              },
            });
          }
          contents.push({ role: "model", parts: modelParts });
          contents.push({ role: "user", parts: responses });
          // If the model already answered in text, one more round only adds noise.
          if (wroteText) break;
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
