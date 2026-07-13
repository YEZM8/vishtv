import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import {
  resolveRadioConfig,
  normalizeNowPlaying,
  RADIO_OFFLINE,
  type RadioNowPlaying,
} from "@/lib/radio";

/**
 * Now-playing proxy for the radio player.
 *
 * Why proxy instead of fetching the stream status from the browser:
 *  - the app is HTTPS on Vercel; a mixed-content / CORS-restricted status
 *    endpoint would be blocked client-side. Server-side we control the fetch.
 *  - caching here (~10s) means hundreds of listeners share one upstream hit.
 *  - it's the single seam to swap SHOUTcast → AzuraCast later: only the
 *    `normalizeShoutcast(...)` line changes.
 */
export const revalidate = 10;

function json(body: RadioNowPlaying) {
  return Response.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
    },
  });
}

export async function GET() {
  const settings = await client.fetch(siteSettingsQuery);
  const { statusUrl, stationName } = resolveRadioConfig(settings);

  if (!statusUrl) return json(RADIO_OFFLINE);

  try {
    const res = await fetch(statusUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 10 },
    });
    if (!res.ok) return json(RADIO_OFFLINE);
    const data = await res.json();
    // Auto-detects SHOUTcast vs AzuraCast from the payload shape, so migrating
    // is a CMS change to `radioStatusUrl` — no code deploy.
    return json(normalizeNowPlaying(data, stationName));
  } catch {
    // Upstream unreachable → present as offline rather than erroring the player.
    return json(RADIO_OFFLINE);
  }
}
