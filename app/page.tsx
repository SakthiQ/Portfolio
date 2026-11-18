import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Featured } from "@/components/sections/Featured";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { Skills } from "@/components/sections/Skills";
import { GithubActivity } from "@/components/sections/GithubActivity";
import { Timeline } from "@/components/sections/Timeline";
import { Contact } from "@/components/sections/Contact";
import { getAllTags, getProjectSummaries } from "@/lib/content";

export const revalidate = 3600;

export default function Home() {
  const projects = getProjectSummaries();
  const featured = projects.filter((p) => p.featured);

  return (
    <main>
      <Hero />
      <About projectCount={projects.length} />
      <Featured projects={featured} />
      <ProjectsGrid projects={projects} tags={getAllTags()} />
      <Skills projects={projects} />
      <GithubActivity />
      <Timeline />
      <Contact />
    </main>
  );
}
