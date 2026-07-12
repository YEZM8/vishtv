# Vish TV Radio — Operations Runbook (migration & go-live)

_Companion to `radio-integration-research.md`. This is the step-by-step for the infrastructure phases that run on the streaming server / DNS (things the app code can't do for itself). The app is already built to plug into each step with **CMS-only changes** — no redeploys needed for cutover._

## How the app is already wired (do this to activate anything)

Everything the player needs is read from **Sanity → Site Settings**. Fields (schema already shipped):

| Field | Purpose | Set it when |
|---|---|---|
| `radioStreamUrl` | The audio URL the `<audio>` element plays | Now (should already be set to the SHOUTcast proxy URL) |
| `radioStationName` | Name shown in player + OS lock-screen | Optional, any time |
| `radioStatusUrl` | JSON now-playing endpoint the app polls | Leave blank on SHOUTcast (auto-derived). Set to the **AzuraCast** `/api/nowplaying/{station}` URL at cutover |
| `radioWebDjUrl` | Browser DJ broadcaster link | When AzuraCast Web DJ is live (Phase 3) |

The now-playing proxy (`/api/nowplaying`) **auto-detects SHOUTcast vs AzuraCast** from the response shape, so switching backends is just editing `radioStatusUrl` in the CMS.

> Verified working today: with `radioStreamUrl` set to `https://server2.vishvavahini.com/proxy/udesh?mp=/stream`, the app auto-derives `…/proxy/udesh/stats?json=1` and shows live now-playing.

---

## Phase 1 — Stand up AzuraCast (parallel, non-disruptive)

Leave the current Centova/SHOUTcast box **running and untouched** throughout.

1. **Provision a VPS** in **Singapore or Mumbai** (lowest latency to Sri Lankan + AU listeners): DigitalOcean, Vultr, or Linode. Size: **2–4 vCPU / 4–8 GB RAM**, **≥100 Mbps** port, **≥8–10 TB/mo** bandwidth. Ubuntu 22.04/24.04 LTS. Avoid OpenVZ/LXC (Docker needs a real kernel).
2. **Install AzuraCast** (Docker, official installer):
   ```bash
   mkdir -p /var/azuracast && cd /var/azuracast
   curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh > docker.sh
   chmod a+x docker.sh
   ./docker.sh install
   ```
3. **Point a hostname** (e.g. `radio.vishtv.com` or reuse the current stream host) at the VPS and let AzuraCast provision **LetsEncrypt TLS** (required for the Web DJ / WSS in Phase 3).
4. **Create the station.** Set it to serve an **Icecast** frontend plus a **SHOUTcast v2** mount so legacy listeners keep working. Recreate the **same mount path** listeners use today. Add mounts: `128k MP3` (primary), optionally `64k AAC`, `Opus`, and `HLS` (Phase 4).
5. **Import the music library**, rebuild **playlists** (rotation + scheduled), and rebuild the **weekly show schedule** to match the current grid.
6. **Test privately for several days:** 24/7 AutoDJ stability, one scheduled show firing, and a live Web DJ takeover with clean auto-fallback back to AutoDJ.

Acceptance: a test player on the new Icecast mount plays 24/7; `GET https://radio…/api/nowplaying/{station}` returns current song + listeners.

---

## Phase 2 — Cutover (keep old URLs alive)

1. **Point the app at the new backend — CMS only:**
   - Set `radioStreamUrl` → the new Icecast/SHOUTcast mount URL.
   - Set `radioStatusUrl` → `https://radio…/api/nowplaying/{station}` (or the `…/nowplaying_static/{shortcode}.json` for cheaper polling).
   - (Optional) Stage this by testing the API URL in a browser first; the proxy auto-detects the AzuraCast shape.
2. **Preserve existing listener URLs** so nobody's saved preset breaks. Either:
   - **DNS/reverse-proxy swap:** keep the current stream hostname and repoint it (DNS, or an nginx `proxy_pass`) to the new mount; **or**
   - **nginx shim** on the old host proxying the legacy `/proxy/udesh…` path to the new mount.
3. **Flip during a low-listener window.** Watch listener counts + logs on the new server. Keep the **old SHOUTcast box hot for 1–2 weeks** as instant rollback (revert the Sanity fields + DNS to roll back).
4. Decommission Centova/SHOUTcast after a couple of clean weeks.

No app redeploy is required for any of this — only Sanity edits and DNS/proxy changes on the server.

---

## Phase 3 — Browser DJ "Go Live" (the WebRTC/WebDJ requirement)

1. In AzuraCast, create a **Streamer/DJ account** per presenter (each gets its own login; optionally assign scheduled slots).
2. Grab the station's **Web DJ URL** (the AzuraCast public "Web DJ" page).
3. In **Sanity → Site Settings**, set `radioWebDjUrl` to that URL. This instantly activates the app's `/radio/go-live` page (already built and linked from `/radio` as "Presenter? Go live →").
4. Presenter flow: open `/radio/go-live` → "Open the broadcaster" → sign in → go live from the browser (2 decks, mic, crossfader). On disconnect, Liquidsoap auto-falls back to AutoDJ.
5. **Caveats to tell presenters:** desktop Chrome/Firefox/Edge only; needs HTTPS (handled) and a stable uplink; **iOS/mobile broadcasting is unreliable** — offer **Mixxx or BUTT** (free) over the Icecast/SHOUTcast source as the pro/fallback path for critical shows.

Later options if you outgrow in-browser MP3: browser **WHIP → MediaMTX → ffmpeg → Icecast** (better quality) or **Janus AudioBridge** (mix several remote presenters into one show). See research doc §3.

---

## Phase 4 — Scale polish (after cutover is proven)

- Enable an **HLS** mount (AAC/Opus) in AzuraCast as a **secondary** stream for lossy mobile networks; keep MP3/ICY primary.
- Put **Cloudflare** (free tier) in front of the HLS path to cache segments and offload origin bandwidth.
- The app's `<audio>` player already accepts whatever `radioStreamUrl` you set; adding `hls.js` is only worth it if you point listeners at the HLS mount and target very lossy networks (adds 6–30s latency).
- Consider surfacing album art + song history from the AzuraCast SSE/WebSocket feed for a richer "Now Playing" widget.

---

## Bandwidth & cost cheat-sheet

- 128 kbps ≈ **16 KB/s** per listener (~57.6 MB/listener/hour).
- Peak egress = listeners × 128 kbps. **300 concurrent ≈ 38.4 Mbps**; ~4–7 TB/month realistic for a few hundred peak listeners.
- Bottleneck is **bandwidth**, not CPU. VPS ≈ **US$10–40/month**. Front with Cloudflare as you grow.
