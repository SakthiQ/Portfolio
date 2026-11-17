import "server-only";
import { site } from "./site";

type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

export type GithubStats = {
  publicRepos: number;
  languages: { name: string; count: number }[];
  recent: { name: string; url: string; description: string; language: string | null; pushedAt: string; stars: number }[];
};

export async function getGithubStats(): Promise<GithubStats | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-site",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(
      `https://api.github.com/users/${site.githubUser}/repos?per_page=100&sort=pushed`,
      { headers, next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const repos = ((await res.json()) as Repo[]).filter((r) => !r.fork && !r.archived);
    const counts = new Map<string, number>();
    for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    return {
      publicRepos: repos.length,
      languages: [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
      recent: repos.slice(0, 6).map((r) => ({
        name: r.name,
        url: r.html_url,
        description: r.description ?? "",
        language: r.language,
        pushedAt: r.pushed_at,
        stars: r.stargazers_count,
      })),
    };
  } catch {
    return null;
  }
}
