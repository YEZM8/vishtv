/**
 * Radio now-playing types + the single place that knows how to read a stream's
 * status. The rest of the app depends only on the normalised `RadioNowPlaying`
 * shape, so migrating SHOUTcast → AzuraCast (or anything else) later means
 * changing only `deriveStatusUrl` + the `normalize*` mapper below — no UI churn.
 *
 * Current source: Centova Cast proxy fronting SHOUTcast DNAS v2
 * (`.../proxy/<user>/stats?json=1`).
 */

export interface RadioNowPlaying {
  /** Station name (from the server, falls back to the app default). */
  station: string;
  /** Track / programme title currently on air. */
  title: string;
  /** Artist, when the title is in "Artist - Track" form; otherwise null. */
  artist: string | null;
  /** Whether the stream is currently online. */
  isLive: boolean;
  /** Current listener count, when the server reports it. */
  listeners: number | null;
  /** Stream bitrate in kbps, when reported. */
  bitrate: number | null;
}

export const RADIO_STATION_FALLBACK = "VishTV Radio";

/**
 * Artwork surfaced on OS lock-screen / Bluetooth / Media Session controls.
 * Points at a real asset in /public so it never renders a broken image.
 */
export const RADIO_ARTWORK: MediaImage[] = [
  { src: "/assets/vishvavahini-logo-primary.png", sizes: "512x512", type: "image/png" },
];

/** A safe "offline" value used whenever the status can't be read. */
export const RADIO_OFFLINE: RadioNowPlaying = {
  station: RADIO_STATION_FALLBACK,
  title: RADIO_STATION_FALLBACK,
  artist: null,
  isLive: false,
  listeners: null,
  bitrate: null,
};

/**
 * Turn a listener stream URL into its status endpoint.
 * `https://host/proxy/udesh?mp=/stream` → `https://host/proxy/udesh/stats?json=1`.
 * Returns null if the URL can't be parsed.
 */
export function deriveStatusUrl(streamUrl: string): string | null {
  try {
    const u = new URL(streamUrl);
    const path = u.pathname.replace(/\/+$/, ""); // drop trailing slashes, ignore query
    return `${u.origin}${path}/stats?json=1`;
  } catch {
    return null;
  }
}

/** Raw shape of SHOUTcast v2 `/stats?json=1` (only the fields we use). */
interface ShoutcastStats {
  songtitle?: string;
  servertitle?: string;
  currentlisteners?: number;
  streamstatus?: number;
  bitrate?: string | number;
}

/** Map a SHOUTcast v2 stats payload onto the normalised now-playing shape. */
export function normalizeShoutcast(
  data: ShoutcastStats,
  stationName?: string | null,
): RadioNowPlaying {
  const raw = (data.songtitle ?? "").trim();

  // SHOUTcast usually reports "Artist - Track". Split on the first " - ", but
  // drop a placeholder "Unknown" artist (common with AutoDJ) rather than show it.
  let artist: string | null = null;
  let title = raw;
  const sep = raw.indexOf(" - ");
  if (sep > 0) {
    const a = raw.slice(0, sep).trim();
    const t = raw.slice(sep + 3).trim();
    if (t && a && a.toLowerCase() !== "unknown") {
      artist = a;
      title = t;
    } else if (t) {
      title = t;
    }
  }

  const station = (stationName || data.servertitle || RADIO_STATION_FALLBACK).trim();
  const bitrate = data.bitrate != null ? Number(data.bitrate) || null : null;

  return {
    station,
    title: title || station,
    artist,
    isLive: data.streamstatus === 1,
    listeners: typeof data.currentlisteners === "number" ? data.currentlisteners : null,
    bitrate,
  };
}

/** Raw shape of AzuraCast `/api/nowplaying/{station}` (only the fields we use). */
interface AzuraCastNowPlaying {
  station?: { name?: string };
  is_online?: boolean;
  listeners?: { total?: number; current?: number };
  now_playing?: { song?: { title?: string; artist?: string; text?: string } };
}

/** Map an AzuraCast now-playing payload onto the normalised now-playing shape. */
export function normalizeAzuraCast(
  data: AzuraCastNowPlaying,
  stationName?: string | null,
): RadioNowPlaying {
  const song = data.now_playing?.song ?? {};
  const text = (song.text ?? "").trim();
  let title = (song.title ?? "").trim();
  let artist = (song.artist ?? "").trim() || null;

  // Fall back to the combined "Artist - Track" text if title/artist are empty.
  if (!title && text) {
    const sep = text.indexOf(" - ");
    if (sep > 0) {
      artist = artist ?? (text.slice(0, sep).trim() || null);
      title = text.slice(sep + 3).trim();
    } else {
      title = text;
    }
  }

  const station = (stationName || data.station?.name || RADIO_STATION_FALLBACK).trim();
  const listeners = data.listeners?.total ?? data.listeners?.current ?? null;

  return {
    station,
    title: title || station,
    artist,
    isLive: data.is_online !== false,
    listeners: typeof listeners === "number" ? listeners : null,
    bitrate: null,
  };
}

/**
 * Pick the right mapper from the payload shape, so the same proxy works before
 * and after a SHOUTcast → AzuraCast migration — cutover is a CMS-only change to
 * the status URL, no code deploy.
 */
export function normalizeNowPlaying(
  data: unknown,
  stationName?: string | null,
): RadioNowPlaying {
  if (data && typeof data === "object" && "now_playing" in data) {
    return normalizeAzuraCast(data as AzuraCastNowPlaying, stationName);
  }
  return normalizeShoutcast(data as ShoutcastStats, stationName);
}
