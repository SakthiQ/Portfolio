import Link from "next/link";
import { Reveal, SectionHeading } from "../Reveal";
import { skills } from "@/lib/site";
import type { ProjectSummary } from "@/lib/types";

// Links each skill to the projects whose stack mentions it.
function usedIn(skill: string, projects: ProjectSummary[]) {
  const s = skill.toLowerCase();
  return projects.filter((p) =>
    [...p.stack, ...p.tags].some((x) => {
      const v = x.toLowerCase();
      return v === s || v.startsWith(s + " ") || (s.length > 3 && v.includes(s));
    }),
  );
}

export function Skills({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section id="skills" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading index="04" title="Skills" subtitle="Hover a skill to see where I've used it." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g, i) => (
          <Reveal key={g.group} delay={i * 0.04}>
            <div className="h-full rounded-xl border border-line bg-surface p-5">
              <h3 className="font-mono text-sm text-accent">{g.group.toLowerCase().replace(/ /g, "_")}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((item) => {
                  const used = usedIn(item, projects);
                  return (
                    <li key={item} className="group relative">
                      <span
                        tabIndex={used.length ? 0 : undefined}
                        className="inline-block cursor-default rounded-md border border-line bg-bg/60 px-2.5 py-1 text-sm text-[#c9d3de] transition group-hover:border-accent/50 group-focus-within:border-accent/50"
                      >
                        {item}
                        {used.length > 0 && <sup className="ml-1 font-mono text-[10px] text-faint">{used.length}</sup>}
                      </span>
                      {used.length > 0 && (
                        <div className="invisible absolute bottom-full left-0 z-20 mb-2 w-56 rounded-lg border border-line bg-surface-2 p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                          <p className="mb-1 font-mono text-[10px] text-faint">used in</p>
                          {used.map((p) => (
                            <Link key={p.slug} href={`/projects/${p.slug}`} className="block truncate rounded px-1 py-0.5 text-xs text-cyan hover:bg-surface">
                              {p.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
