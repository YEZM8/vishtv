import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://vishtv.com").replace(
  /\/$/,
  ""
);

// Only the production deployment (vishtv.com) should be indexed. Preview / dev.vishtv.com
// deployments (VERCEL_ENV !== "production") are blocked so they don't compete with production
// in search or leak staging content. Local dev (no VERCEL_ENV) is allowed.
const isProduction =
  !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
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
