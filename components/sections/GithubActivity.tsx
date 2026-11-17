import { Star } from "lucide-react";
import { Github } from "@/components/icons";
import { Reveal, SectionHeading } from "../Reveal";
import { getGithubStats } from "@/lib/github";
import { site } from "@/lib/site";

const langColor: Record<string, string> = {
  Python: "#3572A5",
  Java: "#b07219",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Solidity: "#AA6746",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export async function GithubActivity() {
  const stats = await getGithubStats();
  return (
    <section id="github" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading index="05" title="Live from GitHub" subtitle="Pulled from the GitHub API and refreshed every hour." />
      {!stats ? (
        <Reveal>
          <a href={site.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 font-mono text-sm text-muted hover:text-fg">
            <Github size={16} aria-hidden /> GitHub is unavailable right now. Visit github.com/{site.githubUser}
          </a>
        </Reveal>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <Reveal>
            <div className="h-full rounded-xl border border-line bg-surface p-5">
              <p className="font-mono text-xs text-faint">public repositories</p>
              <p className="mt-1 font-mono text-3xl text-accent">{stats.publicRepos}</p>
              <p className="mt-6 font-mono text-xs text-faint">top languages (by repo)</p>
              {stats.languages.length > 0 && (
                <>
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-bg" aria-hidden>
                    {stats.languages.map((l) => (
                      <span key={l.name} style={{ flexGrow: l.count, background: langColor[l.name] ?? "#8b98a9" }} />
                    ))}
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {stats.languages.map((l) => (
                      <li key={l.name} className="flex items-center gap-2 text-muted">
                        <span className="size-2.5 rounded-full" style={{ background: langColor[l.name] ?? "#8b98a9" }} aria-hidden />
                        {l.name}
                        <span className="ml-auto font-mono text-xs text-faint">{l.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <a href={site.github} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-cyan hover:underline">
                <Github size={13} aria-hidden /> github.com/{site.githubUser}
              </a>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.recent.map((r, i) => (
              <Reveal key={r.name} delay={i * 0.04}>
                <div className="h-full">
                  <a href={r.url} target="_blank" rel="noreferrer" className="flex h-full flex-col rounded-xl border border-line bg-surface p-4 transition hover:border-accent/40">
                    <span className="font-mono text-sm text-fg">{r.name}</span>
                    <span className="mt-1 line-clamp-2 flex-1 text-xs text-muted">{r.description || "No description"}</span>
                    <span className="mt-3 flex items-center gap-3 font-mono text-[11px] text-faint">
                      {r.language && (
                        <span className="inline-flex items-center gap-1">
                          <span className="size-2 rounded-full" style={{ background: langColor[r.language] ?? "#8b98a9" }} aria-hidden />
                          {r.language}
                        </span>
                      )}
                      {r.stars > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <Star size={11} aria-hidden /> {r.stars}
                        </span>
                      )}
                      <span className="ml-auto">pushed {ago(r.pushedAt)}</span>
                    </span>
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
