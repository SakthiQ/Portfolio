import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Project, ProjectSummary } from "./types";

const root = path.join(process.cwd(), "content");

let projectsCache: Project[] | null = null;

export function getProjects(): Project[] {
  if (projectsCache && process.env.NODE_ENV === "production") return projectsCache;
  const dir = path.join(root, "projects");
  const projects = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      return {
        slug: file.replace(/\.md$/, ""),
        title: String(data.title),
        tagline: String(data.tagline ?? ""),
        year: Number(data.year ?? 0),
        featured: Boolean(data.featured),
        order: Number(data.order ?? 99),
        status: String(data.status ?? ""),
        stack: (data.stack as string[]) ?? [],
        tags: (data.tags as string[]) ?? [],
        github: data.github ? String(data.github) : undefined,
        demo: data.demo ? String(data.demo) : undefined,
        highlights: (data.highlights as string[]) ?? [],
        body: content.trim(),
      } satisfies Project;
    })
    .sort((a, b) => a.order - b.order);
  projectsCache = projects;
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function toSummary(p: Project): ProjectSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { body, ...summary } = p;
  return summary;
}

export function getProjectSummaries(): ProjectSummary[] {
  return getProjects().map(toSummary);
}

export function getAllTags(): string[] {
  const counts = new Map<string, number>();
  for (const p of getProjects()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

export function getKnowledgeDocs(): { name: string; body: string }[] {
  const dir = path.join(root, "knowledge");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ name: f, body: fs.readFileSync(path.join(dir, f), "utf8").trim() }));
}
