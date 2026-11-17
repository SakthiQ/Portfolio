// A small read-only virtual filesystem for the hero terminal, built from the site's real data.
import type { ProjectSummary } from "@/lib/types";
import { site, skills, timeline } from "@/lib/site";

export type VFile = { kind: "file"; lines: string[]; href?: string; project?: string };
export type VDir = { kind: "dir"; children: Record<string, VNode>; project?: string };
export type VNode = VFile | VDir;

export const HOME = ["home", site.handle];

const file = (lines: string[], extra: Partial<VFile> = {}): VFile => ({ kind: "file", lines, ...extra });
const dir = (children: Record<string, VNode>, extra: Partial<VDir> = {}): VDir => ({ kind: "dir", children, ...extra });

function readme(p: ProjectSummary): string[] {
  return [
    `# ${p.title}`,
    p.tagline,
    "",
    `year: ${p.year} · status: ${p.status.toLowerCase()}`,
    `stack: ${p.stack.join(", ")}`,
    "",
    "highlights:",
    ...p.highlights.map((h) => `  - ${h}`),
    ...(p.github ? ["", `code: ${p.github}`] : []),
    "",
    "→ run `open` in this folder for the full case study",
  ];
}

export function buildFs(projects: ProjectSummary[]): VDir {
  const home: Record<string, VNode> = {
    "about.txt": file([
      `${site.fullName} (${site.name}) · ${site.role}`,
      site.tagline,
      "",
      `education: ${site.education}`,
    ]),
    "focus.txt": file([
      "→ secure, grounded AI: RAG that checks its own answers",
      "→ reliable backends: locks, outboxes, idempotency",
      "→ stack: Python, FastAPI, Java, Spring Boot, PostgreSQL, Redis",
      "→ status: B.Tech CSE '27 (VIT) · open to backend & AI roles",
    ]),
    "skills.txt": file(skills.map((g) => `${g.group.toLowerCase()}: ${g.items.join(", ")}`)),
    "experience.txt": file(timeline.map((t) => `${t.when.padEnd(14)} ${t.title}`)),
    "contact.txt": file(
      [
        site.email && `email:    ${site.email}`,
        site.phone && `phone:    ${site.phone}`,
        site.linkedin && `linkedin: ${site.linkedin}`,
        `github:   ${site.github}`,
      ].filter(Boolean) as string[],
    ),
    projects: dir(
      Object.fromEntries(projects.map((p) => [p.slug, dir({ "README.md": file(readme(p), { project: p.slug }) }, { project: p.slug })])),
    ),
    ".bashrc": file(["# you found a hidden file 👀", "alias hire='cat contact.txt'", "export EDITOR=vim  # just kidding"]),
  };
  if (site.resume) home["resume.pdf"] = file(["(binary file) · try: open resume.pdf"], { href: site.resume });
  return dir({ home: dir({ [site.handle]: dir(home) }) });
}

// Resolve a path (absolute, ~-relative or relative to cwd) to segments and a node.
export function resolve(root: VDir, cwd: string[], path: string): { segs: string[]; node: VNode } | null {
  let segs: string[];
  let rest = path;
  if (path === "~" || path.startsWith("~/")) {
    segs = [...HOME];
    rest = path.slice(1);
  } else if (path.startsWith("/")) {
    segs = [];
  } else {
    segs = [...cwd];
  }
  for (const part of rest.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") segs.pop();
    else segs.push(part);
  }
  let node: VNode = root;
  for (const s of segs) {
    if (node.kind !== "dir" || !(s in node.children)) return null;
    node = node.children[s];
  }
  return { segs, node };
}

// "/home/sakthi/projects" -> "~/projects"
export function displayPath(segs: string[]): string {
  const inHome = HOME.every((h, i) => segs[i] === h);
  if (inHome) return "~" + (segs.length > HOME.length ? "/" + segs.slice(HOME.length).join("/") : "");
  return "/" + segs.join("/");
}
