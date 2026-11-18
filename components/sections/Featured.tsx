import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Github } from "@/components/icons";
import { Reveal, SectionHeading } from "../Reveal";
import type { ProjectSummary } from "@/lib/types";
import { AskAboutButton } from "../chat/AskAboutButton";

export function Featured({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section id="featured" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading index="02" title="Featured work" subtitle="Two projects that show how I think: one about trustworthy AI, one about correctness under concurrency." />
      <div className="space-y-8">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05}>
            <article className="group relative overflow-clip rounded-2xl border border-line bg-surface p-6 transition hover:border-accent/50 sm:p-8">
              <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-accent/5 blur-3xl transition group-hover:bg-accent/10" aria-hidden />
              <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <p className="font-mono text-xs text-faint">
                    <span className="text-accent">featured</span> · {p.year} · {p.status.toLowerCase()}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-fg">
                    <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-muted">{p.tagline}</p>
                  <ul className="mt-5 space-y-2">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex gap-2 text-sm text-[#c9d3de]">
                        <span className="font-mono text-accent">›</span> {h}
                      </li>
                    ))}
                  </ul>
                  <div className="relative z-10 mt-6 flex flex-wrap items-center gap-4 font-mono text-sm">
                    <Link href={`/projects/${p.slug}`} className="inline-flex items-center gap-1 text-accent hover:underline">
                      read case study <ArrowUpRight size={14} aria-hidden />
                    </Link>
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-fg">
                        <Github size={14} aria-hidden /> code
                      </a>
                    )}
                    <AskAboutButton title={p.title} />
                  </div>
                </div>
                <div className="flex flex-wrap content-start gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-md border border-line bg-bg/60 px-2.5 py-1 font-mono text-xs text-muted">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
