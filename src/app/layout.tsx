import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LanguageProvider from "@/i18n/LanguageProvider";
import TVModeProvider from "@/components/tv/TVModeProvider";
import { isIndexable } from "@/lib/seo";
import "./globals.css";

const indexable = isIndexable();

export const metadata: Metadata = {
  title: {
    default: "VishTV — Sri Lankan voices, Australian home",
    template: "%s | VishTV",
  },
  description:
    "Live news, drama, music and sport from the Sri Lankan diaspora in Australia.",
  // Site-wide noindex until ALLOW_INDEXING is turned on at cutover (soft-launch protection).
  robots: { index: indexable, follow: indexable },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "VishTV",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="u-sr-only" style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 9999,
          padding: "var(--sp-3) var(--sp-4)",
          background: "var(--blue)",
          color: "#fff",
        }}>
          Skip to content
        </a>
        <LanguageProvider>
          <TVModeProvider>
            {children}
          </TVModeProvider>
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
