import { Reveal, SectionHeading } from "../Reveal";
import { site, timeline } from "@/lib/site";
import { Compass, GraduationCap, Hammer, Wrench } from "lucide-react";

// Four short cards: who I am, what I've built, what I'm into, how I work.
// Everything here comes from the projects, resume and timeline already on this site.
const cards = [
  {
    Icon: GraduationCap,
    title: "Who I am",
    text: "A Computer Science student at VIT Vellore, graduating in 2027. AI intern at Hexaware Technologies, and an Oracle Cloud Generative AI certified professional.",
  },
  {
    Icon: Hammer,
    title: "What I've built",
    text: "A local RAG system that checks its own answers, an appointment platform that can't double-book, a database backup tool, a payments backend with fraud rules, and more.",
  },
  {
    Icon: Compass,
    title: "What I'm into",
    text: "Distributed systems and AI systems: making them correct, secure and trustworthy. Away from the keyboard it’s football, cricket and Red Dead Redemption 2.",
  },
  {
    Icon: Wrench,
    title: "How I work",
    text: "I check things: answers against their sources, backups against checksums, bookings against race conditions. I'd rather ship a small readable tool than a big framework.",
  },
];

export function About({ projectCount }: { projectCount: number }) {
  const internships = timeline.filter((t) => /Intern ·/.test(t.title)).length;
  const gradYear = site.education.match(/(\d{4})\s*$/)?.[1];
  const stats: [string | number, string][] = [
    [projectCount, "projects built"],
    [internships, "internships"],
    ...(gradYear ? ([[gradYear, "graduating"]] as [string, string][]) : []),
  ];

  return (
    <section id="about" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading index="01" title="About" />
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div className="space-y-4 text-lg leading-relaxed text-muted">
            <p>
              I&apos;m <span className="text-fg">{site.fullName}</span>, a Computer Science undergraduate at{" "}
              <span className="text-fg">VIT Vellore</span> who likes the hard, unglamorous parts of software: making sure
              two patients can&apos;t book the same slot, that a backup can actually be restored, and that an AI answer is
              backed by evidence.
            </p>
            <p>
              As an <span className="text-fg">AI Intern at Hexaware Technologies</span>, I built 4+ AI agents on Oracle
              Fusion Cloud for inventory management and procurement.
            </p>
            <p>
              I work mostly in <span className="text-fg">Python, Java and TypeScript</span>, with side trips into Go,
              Solidity and Flutter. This site&apos;s AI assistant knows all of it, so ask it anything.
            </p>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6 font-mono">
            {stats.map(([n, label]) => (
              <div key={label}>
                <dt className="text-xs text-faint">{label}</dt>
                <dd className="mt-1 text-2xl text-accent">{n}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {cards.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="h-full rounded-xl border border-line bg-surface p-5 transition hover:border-accent/40">
                <Icon size={18} className="text-accent" aria-hidden />
                <h3 className="mt-3 font-medium text-fg">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
