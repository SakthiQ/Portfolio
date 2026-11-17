import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Github } from "@/components/icons";
import { getProject, getProjects } from "@/lib/content";
import { AskAboutButton } from "@/components/chat/AskAboutButton";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.tagline, openGraph: { title: p.title, description: p.tagline } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  const next = all[(idx + 1) % all.length];

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <Link href="/#projects" className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent">
        <ArrowLeft size={13} aria-hidden /> cd ../projects
      </Link>

      <header className="mt-8 border-b border-line pb-8">
        <p className="font-mono text-xs text-faint">
          {project.featured && <span className="text-accent">featured · </span>}
          {project.year} · {project.status.toLowerCase()}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{project.title}</h1>
        <p className="mt-4 text-lg text-muted">{project.tagline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-5 font-mono text-sm">
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-fg hover:text-accent">
              <Github size={15} aria-hidden /> source code
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-fg hover:text-accent">
              <ExternalLink size={15} aria-hidden /> live demo
            </a>
          )}
          <AskAboutButton title={project.title} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span key={s} className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted">
              {s}
            </span>
          ))}
        </div>
      </header>

      {project.highlights.length > 0 && (
        <section aria-label="Highlights" className="mt-8 grid gap-3 sm:grid-cols-2">
          {project.highlights.map((h) => (
            <div key={h} className="rounded-lg border border-line bg-surface p-4 text-sm text-[#c9d3de]">
              <span className="mr-1.5 font-mono text-accent">›</span>
              {h}
            </div>
          ))}
        </section>
      )}

      <article className="prose-term mt-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.body}</ReactMarkdown>
      </article>

      <nav className="mt-16 border-t border-line pt-8" aria-label="Next project">
        <Link href={`/projects/${next.slug}`} className="group flex items-center justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-accent/50">
          <span>
            <span className="block font-mono text-xs text-faint">next project</span>
            <span className="mt-1 block text-fg">{next.title}</span>
          </span>
          <ArrowRight size={18} className="text-accent transition group-hover:translate-x-1" aria-hidden />
        </Link>
      </nav>
    </main>
  );
}
