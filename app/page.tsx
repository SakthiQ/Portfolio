import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Featured } from "@/components/sections/Featured";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { Skills } from "@/components/sections/Skills";
import { GithubActivity } from "@/components/sections/GithubActivity";
import { Timeline } from "@/components/sections/Timeline";
import { Contact } from "@/components/sections/Contact";
import { getAllTags, getProjectSummaries } from "@/lib/content";
import { skills } from "@/lib/site";

export const revalidate = 3600;

// Test counts from the resume and READMEs: ATTS-RAG 515, Healthcare 137, BitbyBit 112, ChainJudge 38 (802 total).
const TESTS_WRITTEN = 800;

export default function Home() {
  const projects = getProjectSummaries();
  const featured = projects.filter((p) => p.featured);
  const languages = skills.find((g) => g.group === "Languages")?.items.length ?? 0;

  return (
    <main>
      <Hero />
      <About stats={{ projects: projects.length, tests: TESTS_WRITTEN, languages }} />
      <Featured projects={featured} />
      <ProjectsGrid projects={projects} tags={getAllTags()} />
      <Skills projects={projects} />
      <GithubActivity />
      <Timeline />
      <Contact />
    </main>
  );
}
