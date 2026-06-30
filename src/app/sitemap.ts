import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { sitemapQuery } from "@/lib/queries";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://vishtv.com").replace(
  /\/$/,
  ""
);

// Refresh the sitemap hourly (content is added via CMS + daily YouTube sync).
export const revalidate = 3600;

type SitemapData = {
  articles?: { slug: string; updated?: string }[];
  programmes?: { slug: string; updated?: string }[];
  videos?: { id: string; updated?: string }[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "daily" },
    { path: "/news", priority: 0.9, freq: "daily" },
    { path: "/watch", priority: 0.9, freq: "daily" },
    { path: "/browse", priority: 0.8, freq: "weekly" },
    { path: "/radio", priority: 0.6, freq: "weekly" },
    { path: "/events", priority: 0.7, freq: "weekly" },
    { path: "/about", priority: 0.4, freq: "yearly" },
    { path: "/contact", priority: 0.4, freq: "yearly" },
    { path: "/advertise", priority: 0.4, freq: "yearly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const data: SitemapData | null = await client.fetch(sitemapQuery);
  if (data) {
    for (const a of data.articles ?? []) {
      entries.push({
        url: `${BASE}/news/${encodeURIComponent(a.slug)}`,
        lastModified: a.updated ? new Date(a.updated) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    for (const p of data.programmes ?? []) {
      entries.push({
        url: `${BASE}/browse/${encodeURIComponent(p.slug)}`,
        lastModified: p.updated ? new Date(p.updated) : now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const v of data.videos ?? []) {
      entries.push({
        url: `${BASE}/watch/${encodeURIComponent(v.id)}`,
        lastModified: v.updated ? new Date(v.updated) : now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
