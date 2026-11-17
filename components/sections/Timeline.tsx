import { Reveal, SectionHeading } from "../Reveal";
import { timeline } from "@/lib/site";

export function Timeline() {
  // Entries still marked TODO are hidden until filled in (see lib/site.ts).
  const items = timeline.filter((t) => !/TODO/.test(t.when + t.title + t.detail));
  return (
    <section id="timeline" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading index="06" title="Journey" />
      <div className="relative ml-2 border-l border-line">
        {items.map((t, i) => (
          <Reveal key={t.title} delay={i * 0.05}>
            <div className="relative pb-10 pl-8">
              <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-bg bg-accent" aria-hidden />
              <p className="font-mono text-xs text-accent">{t.when}</p>
              <h3 className="mt-1 font-medium text-fg">{t.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-muted">{t.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
