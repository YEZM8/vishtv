import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LanguageProvider from "@/i18n/LanguageProvider";
import TVModeProvider from "@/components/tv/TVModeProvider";
import RadioPlayerProvider from "@/components/player/RadioPlayerProvider";
import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import { RADIO_STATION_FALLBACK } from "@/lib/radio";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Radio config lives in the CMS; the root layout persists across navigation,
  // so the player mounted here keeps playing as the listener moves around.
  const settings = await client.fetch(siteSettingsQuery);
  const radioStreamUrl: string | null = settings?.radioStreamUrl ?? null;
  const radioStationName: string = settings?.radioStationName ?? RADIO_STATION_FALLBACK;

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
            <RadioPlayerProvider
              streamUrl={radioStreamUrl}
              stationName={radioStationName}
            >
              {children}
            </RadioPlayerProvider>
          </TVModeProvider>
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
