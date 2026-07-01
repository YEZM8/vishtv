import type { MetadataRoute } from "next";
import { isIndexable } from "@/lib/seo";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://vishtv.com").replace(
  /\/$/,
  ""
);

export default function robots(): MetadataRoute.Robots {
  // Non-production, or production before ALLOW_INDEXING is turned on (soft launch), is fully
  // blocked from crawling so it never competes with the still-live Wix site.
  if (!isIndexable()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // CMS and API endpoints shouldn't be crawled
      disallow: ["/studio", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
