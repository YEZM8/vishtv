# Vishvavahini Radio → Vish TV App: Integration Research & Recommendation

_Research date: 2026-07-10. Compiled from four parallel research streams (streaming stack, browser-broadcast bridge, Next.js player, server migration), each verified against official docs/GitHub._

---

## 0. What's actually running today (verified live, not assumed)

Probed `https://server2.vishvavahini.com/proxy/udesh?mp=/stream`:

| Layer | Reality |
|---|---|
| Control panel | **Centova Cast v3.3.2** |
| Streaming server | **SHOUTcast DNAS v2.6.1.777** (posix linux x64) — _not_ Icecast |
| Web proxy | `cc-web/1.6.3` → the `/proxy/udesh?mp=/stream` URL |
| Stream format | **MP3, 128 kbps, 44.1 kHz**, mount name `Vishvavahini`, ICY metadata interval 8192 |
| CORS | `Access-Control-Allow-Origin: *` (browser-playable) |
| App | **Next.js 16 / React 19 / TypeScript on Vercel** |
| CMS | **Sanity** (Studio embedded at `/studio`); `radioStreamUrl` already a field in `siteSettings` |
| Radio page today | `src/app/radio/page.tsx` — a single bare `<audio controls>` tag. No now-playing, no persistence across routes, no reconnect. |

Centova is only the GUI/automation layer. SHOUTcast is the actual server listeners hit. A migration is two independent decisions: **(a) streaming server** (SHOUTcast → Icecast) and **(b) automation layer** (Centova → AzuraCast).

---

## 1. Headline recommendation

**Migrate the streaming backend to self-hosted [AzuraCast](https://github.com/AzuraCast/AzuraCast) (Apache-2.0), on a Singapore or Mumbai VPS, keeping the existing SHOUTcast-compatible URL alive through cutover. Build a persistent Next.js player against AzuraCast's now-playing API. Use AzuraCast's built-in browser WebDJ for "DJ from anywhere," linked from the app.**

Why AzuraCast wins on every axis we researched:

- It **bundles Icecast + SHOUTcast v2 + Liquidsoap (AutoDJ) + a browser WebDJ + a now-playing API + listener analytics** in one Docker install — it replaces Centova *and* upgrades the server *and* solves browser DJ broadcasting in a single move.
- It can **keep serving a SHOUTcast-compatible URL**, so existing listeners/players don't break during migration.
- Its **now-playing API** (REST JSON + static JSON + real-time WebSocket/SSE via Centrifugo) is purpose-built for exactly the Next.js integration we need.
- It's **free/OSS and cheap to host** (~US$10–40/mo VPS vs €50+/mo commercial radio hosting), and actively maintained (rolling releases through July 2026).

The one honest caveat: AzuraCast's browser WebDJ is **desktop-first and requires HTTPS/WSS**; mobile (esp. iOS) broadcasting is fragile. That's a limitation of _all_ browser-broadcast tech today, not just AzuraCast — see §3.

---

## 2. The listener player (Next.js integration)

### Architecture (build custom, ~150 lines — file players fight you on live streams)

```
app/
  layout.tsx                    // <PersistentPlayer/> mounted BESIDE {children} in root layout
  radio/page.tsx                // radio landing page (schedule, presenters from Sanity)
  api/nowplaying/route.ts       // server proxy → AzuraCast/SHOUTcast now-playing JSON (HTTPS, cached)
components/player/
  PersistentPlayer.tsx          // 'use client' — the single <audio ref>, mediaSession, reconnect
store/
  playerStore.ts                // zustand: isPlaying, wantPlaying, volume, nowPlaying, connState
hooks/
  useNowPlaying.ts              // polls /api/nowplaying (or subscribes to AzuraCast SSE)
```

### Five rules that make it robust

1. **One `<audio preload="none">`, mounted once in the root layout, outside `{children}`.** The App Router root layout doesn't re-render on navigation, so audio survives every route change. State in **Zustand** (lives outside React tree → route transitions never reset it; any page's "Listen" button can call `usePlayerStore.getState().play()`).

2. **Metadata by server-status polling, NOT client-side ICY parsing.** Use [`icecast-metadata-stats`](https://www.npmjs.com/package/icecast-metadata-stats) (works with both SHOUTcast v2 and Icecast) or AzuraCast's JSON. **Do not** use `icecast-metadata-player`'s streaming ICY parser: it runs its own MediaSource/Web Audio pipeline which **breaks `navigator.mediaSession` on iOS lock screens** ([issue #193](https://github.com/eshaz/icecast-metadata-js/issues/193)). A plain `<audio>` tag + separate metadata poll keeps lock-screen controls working.

3. **Proxy the now-playing fetch through a Next.js Route Handler.** Your app is HTTPS on Vercel; if the SHOUTcast status endpoint is HTTP-only, the browser blocks it (mixed content). `app/api/nowplaying/route.ts` server-fetches `/stats?sid=1&json=1` (SHOUTcast) or `/api/nowplaying/{station}` (AzuraCast), normalizes to `{ title, artist, listeners }`, returns HTTPS JSON with `Cache-Control: s-maxage=10` so all listeners share one upstream hit. **On migration to AzuraCast, swap only this handler's internals — zero client changes.**

4. **Wire `navigator.mediaSession`** for lock-screen / Bluetooth / OS media controls: set `metadata` (title, artist, **multiple artwork sizes** 96/256/512), keep `playbackState` in sync on every play/pause, and **null out** seek/next/prev handlers (radio is live, no scrubbing).

5. **Resilience watchdog**: on `error`/`stalled`/`ended`, reconnect with **capped exponential backoff** (gated by a `wantPlaying` intent flag so you don't fight a user pause), cache-bust the URL (`?_=Date.now()`) to force a fresh connection, reset backoff on `playing`.

### Transport: raw MP3, do NOT add HLS to the player
A native `<audio src>` on the ICY MP3 URL is the most reliable path. `hls.js` only helps if the _server_ produces HLS segments, and it adds 6–30 s latency. Add HLS later as a _secondary_ CDN-cached mount for lossy mobile networks (§4), but keep MP3/ICY primary.

**Key libraries:** [`icecast-metadata-js`](https://github.com/eshaz/icecast-metadata-js) (LGPL, active Oct 2025) · [Zustand] · optionally borrow UI from [`react-h5-audio-player`](https://github.com/lhz516/react-h5-audio-player) (MIT).

---

## 3. "DJ from anywhere via the browser" (the WebRTC broadcast question)

### The core problem
Browsers emit WebRTC (Opus) or MediaRecorder (WebM/Opus) — neither of which Icecast/SHOUTcast accept. Something must bridge browser → Icecast source protocol. There are exactly three families of bridge:

| # | Approach | Representative tools | Verdict |
|---|---|---|---|
| **A** | Encode MP3/Ogg **in the browser** (WASM), stream over WebSocket to Liquidsoap `input.harbor` | **webcast.js / webcaster** → Liquidsoap; **AzuraCast WebDJ** wraps this | ✅ **Recommended** — lowest effort, proven |
| **B** | Browser **WHIP/WebRTC** ingest → media server → ffmpeg transcode → Icecast | **MediaMTX** (best, MIT, 19k★) / **SRS** / **Janus AudioBridge** (best for mixing multiple DJs) | Higher quality (Opus end-to-end) but more ops |
| **C** | All-in-one apps | AzuraCast (=A done right); **OpenStudio** (multi-host, pre-1.0) | AzuraCast now; OpenStudio to watch |

### Recommendation: use AzuraCast's built-in WebDJ (Approach A)
- **Two decks, crossfader, mixer, live mic** in the browser, no install. Under the hood it's a maintained `webcaster.js` fork → WebSocket → Liquidsoap `input.harbor` → Icecast — the same live path as BUTT/Mixxx, so **live→AutoDJ auto-fallback is automatic** (DJ disconnects → Liquidsoap drops back to playlists).
- **Multiple DJ accounts**, each with its own login and optional scheduled slot; any DJ connects from anywhere. One live source on-air at a time (standard radio model).
- **Requires HTTPS/WSS** (AzuraCast's built-in LetsEncrypt handles this) — the #1 failure mode is a missing/broken TLS cert.
- **Desktop-first.** Chrome/Firefox/Edge solid; **iOS Safari broadcasting is unreliable** (Safari audio + background throttling). Provide **BUTT or Mixxx over Icecast** as the reliable fallback for critical shows.

### When to graduate to Approach B (later, optional)
- **Higher audio quality / lower latency:** browser **WHIP → MediaMTX → ffmpeg → Icecast** keeps Opus end-to-end (better than in-browser libshine MP3), and mobile WHIP publishing is solid.
- **Panel / call-in shows with several remote presenters talking together:** **Janus AudioBridge** mixes them server-side and RTP-forwards one mixed stream to ffmpeg → Icecast (officially documented pattern). This is the _only_ mature multi-DJ-mixing option.
- **[OpenStudio](https://github.com/msitarzewski/openstudio)** (MIT) is purpose-built for multi-host community radio with in-browser mix-minus and native Icecast, but it's **pre-1.0 / not production-ready** — prototype only.

⚠️ Note: standalone `webcast.js`/`webcaster` upstream has been **dormant since 2023** and rides deprecated `ScriptProcessorNode`; it's only kept alive because AzuraCast maintains its own fork. This is a strong reason to use AzuraCast's WebDJ rather than self-hosting raw webcast.js. Liquidsoap has **no native WebRTC input** — the 2013 feature request was never implemented.

### How this ties into "our CMS"
Two distinct control surfaces, don't conflate them:
- **Sanity** = editorial content (show descriptions, presenter bios, weekly schedule grid, announcements). Already your CMS.
- **AzuraCast** = radio operations (DJ accounts, WebDJ live broadcasting, playlists, AutoDJ, stats).

From the Vish TV app you **link/embed** the AzuraCast WebDJ for logged-in presenters (a "Go Live" button on a presenter dashboard), while Sanity drives the public-facing show/schedule content the player displays. You can later build a thin custom broadcaster page against the same Liquidsoap harbor if you want it fully inside your own UI.

---

## 4. Streaming-server migration (SHOUTcast → Icecast via AzuraCast)

### Why Icecast over SHOUTcast v2
| Capability | Icecast (via AzuraCast) | SHOUTcast v2 (today) |
|---|---|---|
| License | Open source (GPL-2.0) | Proprietary (free but closed) |
| Now-playing JSON API | Clean, built-in (+ AzuraCast's richer API) | Clunky |
| CORS | Configurable | Weak/awkward |
| Native TLS | Yes (on-the-fly reload; TLS+plain same port in 2.5.x) | No — needs reverse proxy |
| Mount points + fallback (live↔AutoDJ) | First-class | Stream-ID model, less flexible |
| Codecs | MP3, AAC, **Opus, Vorbis, WebM** | MP3, AAC |
| HLS | Via KH fork / Liquidsoap / ffmpeg | SHOUTcast-flavored |

Current versions (verified): **Icecast 2.5.0** (2025-12-31), **Liquidsoap 2.4.4** (Aug 2025 line), AzuraCast rolling. Centova Cast v3 is effectively **legacy/maintenance mode** (no meaningful 2025–26 releases found) — a proprietary dead-end.

### Alternatives considered
- **LibreTime** (AGPL) — better if your #1 need is an elaborate weekly show grid with many presenters; heavier stack (Postgres + RabbitMQ), weaker in-browser DJ and API. Second choice.
- **Rivendell** — professional broadcast-plant automation, desktop Qt app, no web panel/API. **Not a fit.**
- **Raw Liquidsoap + Icecast** — maximum control, but Liquidsoap is a functional scripting language with a real learning curve. Let AzuraCast generate/manage the Liquidsoap config instead; drop to custom `.liq` only for special cases.

### HLS: add later as a secondary variant, not a replacement
Keep MP3/ICY primary (universal, low latency, every existing listener works). Add an AzuraCast HLS mount (AAC/Opus) for flaky mobile networks + **Cloudflare CDN cacheability** (big bandwidth offload as you grow). Trade-off: +6–30 s latency. Do this _after_ the core cutover is proven.

### Hosting & bandwidth math
- 128 kbps ≈ **16 KB/s** per listener (~57.6 MB/listener/hour). Peak egress = N × 128 kbps. **300 concurrent ≈ 38.4 Mbps**, worst-case ~12.4 TB/mo pinned; realistic average **~4–7 TB/mo**.
- CPU/RAM are **not** the bottleneck (one user ran 5000 streams on 2 vCPU/4 GB). Bottlenecks are **port speed (≥100 Mbps)** and **monthly bandwidth allowance (≥8–10 TB)**.
- Sizing: **2–4 vCPU / 4–8 GB RAM**, ~**US$10–40/mo**.
- **Provider:** pick a **Singapore or Mumbai** region for Sri Lankan listener latency — **DigitalOcean / Vultr / Linode** all have those regions. Contabo (Singapore) is cheapest. Front with **Cloudflare** (free) for HLS/web assets. Avoid Hetzner (EU/US only → higher latency to LK).

---

## 5. Low-risk migration path (don't break existing listeners)

1. **Stand up AzuraCast in parallel** on a new Singapore/Mumbai VPS (Docker). Import music library, rebuild playlists + schedule. **Leave Centova/SHOUTcast running untouched.**
2. **Test privately for several days:** 24/7 stability, AutoDJ, a scheduled show, a live WebDJ takeover with clean fallback. Confirm the now-playing API returns what the app needs.
3. **Wire the Next.js app against the new API behind a staging deploy / feature flag** before any public cutover. (Because metadata goes through `app/api/nowplaying/route.ts`, this is an internal swap.)
4. **Preserve the old URL** — the key to not breaking listeners. Either repoint the `stream.*` hostname (DNS / nginx reverse proxy) at the new Icecast mount, or run an nginx shim proxying the legacy SHOUTcast path to the new mount.
5. **Cut over in a low-listener window.** Flip DNS/proxy, watch listener counts + logs. Keep the old SHOUTcast box hot as instant rollback for 1–2 weeks.
6. **Add HLS + Cloudflare** only after the core cutover is proven stable.
7. **Decommission Centova/SHOUTcast** after a couple of clean weeks.

---

## 6. Proposed phased delivery for the Vish TV app

**Phase 0 — Quick win now (no infra change, ~½ day):** Upgrade the existing `/radio` page from a bare `<audio>` into a proper persistent player (Zustand + root-layout mount + reconnect + mediaSession) reading now-playing from a new `app/api/nowplaying/route.ts` that proxies the _current_ SHOUTcast `/stats?json=1`. Ships listener value immediately against today's server.

**Phase 1 — Stand up AzuraCast** in parallel (staging), validate, wire the app's now-playing proxy to it behind a flag.

**Phase 2 — Cut over** the stream (keep old URL alive), point the app at AzuraCast, enable listener stats.

**Phase 3 — Browser DJ:** enable AzuraCast WebDJ + streamer accounts; add a "Go Live" presenter entry point in the app; document a Mixxx/BUTT fallback.

**Phase 4 — Scale polish:** HLS secondary mount + Cloudflare; Opus mount; richer now-playing widget (album art, history) via AzuraCast SSE/WebSocket.

---

## 7. Key repos & sources
- AzuraCast — https://github.com/AzuraCast/AzuraCast · now-playing API https://www.azuracast.com/docs/developers/now-playing-data/ · WebDJ https://www.azuracast.com/docs/user-guide/streamers-and-djs/
- Icecast 2.5.0 — https://icecast.org/news/icecast-release-2_5_0/ · KH fork https://github.com/karlheyes/icecast-kh
- Liquidsoap — https://github.com/savonet/liquidsoap
- Browser broadcast — webcast.js https://github.com/webcast/webcast.js · MediaMTX https://github.com/bluenviron/mediamtx · SRS https://github.com/ossrs/srs · Janus AudioBridge https://janus.conf.meetecho.com/docs/audiobridge · OpenStudio https://github.com/msitarzewski/openstudio
- Next.js player — icecast-metadata-js https://github.com/eshaz/icecast-metadata-js (iOS mediaSession caveat #193) · react-h5-audio-player https://github.com/lhz516/react-h5-audio-player · MDN Media Session https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
- LibreTime https://github.com/libretime/libretime · Rivendell https://github.com/ElvishArtisan/rivendell
