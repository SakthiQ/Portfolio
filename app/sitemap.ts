import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, priority: 1 },
    { url: `${site.url}/chat`, priority: 0.6 },
    ...getProjects().map((p) => ({ url: `${site.url}/projects/${p.slug}`, priority: p.featured ? 0.9 : 0.7 })),
  ];
}
