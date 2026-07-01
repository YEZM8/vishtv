import type { NextConfig } from "next";

// Legacy Wix hosts to migrate to vishtv.com.
const LEGACY_HOSTS = ["vishvavahini.com", "www.vishvavahini.com"];
const NEW_ORIGIN = "https://vishtv.com";

// Legacy path → new path mappings (Wix routes → VishTV routes).
const PATH_MAP: Record<string, string> = {
  "/all-news": "/news",
  "/tv-live": "/watch",
  "/teledrama": "/browse",
  "/movies": "/browse",
  "/event-list": "/events",
  "/privacy-policy": "/privacy",
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  async redirects() {
    // Same-site transforms: apply on ANY host (incl. vishtv.com) so old paths still resolve
    // if someone lands on the new domain with a legacy path.
    const sameSite = [
      ...Object.entries(PATH_MAP).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      // Wix blog posts (migrated slugs match) → article pages.
      { source: "/post/:slug", destination: "/news/:slug", permanent: true },
    ];

    // One-hop: on the legacy Wix hosts, transform legacy paths straight to the final
    // vishtv.com URL (a single 301, no intermediate hop). Must precede the catch-all.
    const oneHop = LEGACY_HOSTS.flatMap((host) => [
      ...Object.entries(PATH_MAP).map(([source, dest]) => ({
        source,
        has: [{ type: "host" as const, value: host }],
        destination: `${NEW_ORIGIN}${dest}`,
        permanent: true,
      })),
      {
        source: "/post/:slug",
        has: [{ type: "host" as const, value: host }],
        destination: `${NEW_ORIGIN}/news/:slug`,
        permanent: true,
      },
    ]);

    // Catch-all: everything else on the legacy hosts → same path on vishtv.com.
    const catchAll = LEGACY_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${NEW_ORIGIN}/:path*`,
      permanent: true,
    }));

    return [...oneHop, ...sameSite, ...catchAll];
  },
};

export default nextConfig;
