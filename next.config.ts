import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  async redirects() {
    return [
      // Legacy vishvavahini.com route mappings
      { source: "/tv-live", destination: "/watch", permanent: true },
      { source: "/all-news", destination: "/news", permanent: true },
      { source: "/teledrama", destination: "/browse", permanent: true },
      { source: "/movies", destination: "/browse", permanent: true },
      // Domain redirect: vishvavahini.com → vishtv.com (all paths)
      {
        source: "/:path*",
        has: [{ type: "host", value: "vishvavahini.com" }],
        destination: "https://vishtv.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vishvavahini.com" }],
        destination: "https://vishtv.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
