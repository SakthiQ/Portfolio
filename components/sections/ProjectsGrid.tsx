"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Github } from "@/components/icons";
import { SectionHeading } from "../Reveal";
import { FILTER_EVENT } from "../chat/ChatProvider";
import type { ProjectSummary } from "@/lib/types";

const statusColor: Record<string, string> = {
  active: "text-accent",
  complete: "text-cyan",
  "in progress": "text-amber",
  prototype: "text-amber",
};

export function ProjectsGrid({ projects, tags }: { projects: ProjectSummary[]; tags: string[] }) {
  const [tag, setTag] = useState<string>("All");
  const reduce = useReducedMotion();

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tag");
    if (fromUrl && tags.includes(fromUrl)) setTag(fromUrl);
    const onFilter = (e: Event) => {
      const t = (e as CustomEvent<string>).detail;
      setTag(tags.includes(t) ? t : "All");
    };
    window.addEventListener(FILTER_EVENT, onFilter);
    return () => window.removeEventListener(FILTER_EVENT, onFilter);
  }, [tags]);

  const shown = useMemo(() => (tag === "All" ? projects : projects.filter((p) => p.tags.includes(tag))), [projects, tag]);

  return (
    <section id="projects" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading index="03" title="All projects" subtitle="Backends, AI, developer tools, blockchain and mobile. Filter by area, or ask the AI to do it for you." />

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
        {["All", ...tags].map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            aria-pressed={tag === t}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition ${
              tag === t ? "border-accent bg-accent/15 text-accent" : "border-line text-muted hover:border-faint hover:text-fg"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <motion.ul layout={!reduce} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <motion.li
              key={p.slug}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="group relative flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className={statusColor[p.status.toLowerCase()] ?? "text-muted"}>● {p.status.toLowerCase()}</span>
                <span className="text-faint">{p.year}</span>
              </div>
              <h3 className="mt-3 font-medium text-fg">
                <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">{p.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.slice(0, 4).map((s) => (
                  <span key={s} className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-faint">
                    {s}
                  </span>
                ))}
                {p.stack.length > 4 && <span className="px-1 font-mono text-[11px] text-faint">+{p.stack.length - 4}</span>}
              </div>
              <div className="relative z-10 mt-4 flex items-center gap-4 font-mono text-xs">
                <span className="inline-flex items-center gap-1 text-accent opacity-80 group-hover:opacity-100">
                  details <ArrowUpRight size={12} aria-hidden />
                </span>
                {p.github && (
                  <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-fg" aria-label={`${p.title} on GitHub`}>
                    <Github size={12} aria-hidden /> code
                  </a>
                )}
              </div>
            </motion.li>
          ))}
      </motion.ul>
    </section>
  );
}
