"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import { Github } from "@/components/icons";
import { Terminal } from "./Terminal";
import { useChat } from "../chat/ChatProvider";
import { site } from "@/lib/site";

const PROMPTS = ["What has Sakthi built with AI?", "Is Sakthi a good fit for a backend role?", "Explain the anti-double-booking engine"];

export function Hero() {
  const { ask } = useChat();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    ask(q);
    setQ("");
  };

  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay } };

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.p {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 font-mono text-xs text-muted">
            <span className="size-1.5 rounded-full bg-accent" /> open to opportunities
          </motion.p>
          <motion.h1 {...fade(0.05)} className="mt-5 text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-6xl">
            Hi, I&apos;m {site.name}.
            <br />
            <span className="bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">{site.role}.</span>
          </motion.h1>
          <motion.p {...fade(0.12)} className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            {site.tagline}
          </motion.p>

          <motion.form {...fade(0.2)} onSubmit={submit} className="mt-8 max-w-xl">
            <label htmlFor="hero-ask" className="mb-2 flex items-center gap-1.5 font-mono text-xs text-accent">
              <Sparkles size={12} aria-hidden /> ask my AI anything about me
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-1.5 pl-4 transition focus-within:border-accent/70 focus-within:shadow-[0_0_0_4px] focus-within:shadow-accent-dim">
              <input
                id="hero-ask"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="e.g. What's your strongest project?"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-fg outline-none placeholder:text-faint"
              />
              <button type="submit" className="grid size-9 place-items-center rounded-lg bg-accent text-bg transition hover:brightness-110" aria-label="Ask">
                <ArrowUp size={17} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => ask(p)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-accent/60 hover:text-fg"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.form>

          <motion.div {...fade(0.28)} className="mt-8 flex items-center gap-5 font-mono text-sm">
            <a href="#featured" className="inline-flex items-center gap-1.5 text-fg hover:text-accent">
              <ArrowDown size={15} aria-hidden /> see my work
            </a>
            <a href={site.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-fg">
              <Github size={15} aria-hidden /> github
            </a>
          </motion.div>
        </div>

        <motion.div {...(reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: 0.15 } })}>
          <Terminal />
        </motion.div>
      </div>
    </section>
  );
}
