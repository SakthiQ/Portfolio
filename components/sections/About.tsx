import { Reveal, SectionHeading } from "../Reveal";
import { site } from "@/lib/site";
import { ShieldCheck, Server, Database, FlaskConical } from "lucide-react";

const pillars = [
  { Icon: ShieldCheck, title: "Secure, grounded AI", text: "RAG pipelines that verify every sentence, resist prompt injection and refuse to guess." },
  { Icon: Server, title: "Reliable backends", text: "Distributed locks, transactional outboxes and idempotent transactions that survive real load." },
  { Icon: Database, title: "Data that holds up", text: "Multi-database backups with verified restores, and schema design across SQL and NoSQL." },
  { Icon: FlaskConical, title: "Tested and honest", text: "Hundreds of tests across projects, and READMEs that say what the software does not do." },
];

export function About({ stats }: { stats: { projects: number; tests: number; languages: number } }) {
  return (
    <section id="about" className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading index="01" title="About" />
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div className="space-y-4 text-lg leading-relaxed text-muted">
            <p>
              I&apos;m <span className="text-fg">{site.fullName}</span>, a Computer Science undergraduate at{" "}
              <span className="text-fg">VIT Vellore</span> (2027) who likes the hard, unglamorous parts: making sure two
              patients can&apos;t book the same slot, that a backup can actually be restored, and that an AI answer is
              backed by evidence.
            </p>
            <p>
              As an <span className="text-fg">AI Intern at Hexaware Technologies</span>, I built 4+ AI agents on Oracle
              Fusion Cloud for inventory management and procurement. I&apos;m also an Oracle Cloud Infrastructure 2025
              Certified Generative AI Professional.
            </p>
            <p>
              Lately I&apos;ve been working on <span className="text-fg">secure retrieval-augmented generation</span>: systems
              that run locally, check their own answers sentence by sentence and get stricter when someone tries to trick them.
            </p>
            <p>
              I work mostly in <span className="text-fg">Python, Java and TypeScript</span>, with side trips into Go, Solidity and
              Flutter. This site&apos;s AI assistant knows all of it, so ask it anything.
            </p>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6 font-mono">
            {[
              [stats.projects, "projects"],
              [`${stats.tests}+`, "tests written"],
              [stats.languages, "languages"],
            ].map(([n, label]) => (
              <div key={String(label)}>
                <dt className="text-xs text-faint">{label}</dt>
                <dd className="mt-1 text-2xl text-accent">{n}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {pillars.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="h-full rounded-xl border border-line bg-surface p-5 transition hover:border-accent/40">
                <Icon size={18} className="text-accent" aria-hidden />
                <h3 className="mt-3 font-medium text-fg">{title}</h3>
                <p className="mt-1.5 text-sm text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
