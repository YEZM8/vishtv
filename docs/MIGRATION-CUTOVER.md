# Vishvavahini → VishTV: Traffic Migration & Cutover Plan

Migrating traffic from the legacy Wix site **www.vishvavahini.com** to the new Next.js site
**vishtv.com**, preserving SEO, then decommissioning Wix safely.

_Last updated: 2026-07-01_

---

## 0. Current status (as of 1 Jul 2026)

- ✅ **`vishtv.com` is LIVE** with the full new site (2,481 articles + 991 videos), **non-indexed**
  (soft launch — `ALLOW_INDEXING` off). DNS for `vishtv.com` now points to Vercel (apex A →
  `216.198.79.1`, `www` CNAME → Vercel; managed at **Hostinger**).
- ✅ **`vishvavahini.com` still on Wix**, untouched, serving its audience in parallel.
- ⏳ **Not yet done:** bake period → cutover (indexing on + DNS repoint) → Wix decommission.
- ⚠️ **Confirmed:** `vishvavahini.com` uses **Wix nameservers** (`wixdns.net`) — the domain is
  managed (and likely registered) through Wix. Secure it before decommissioning (see §4).

---

## 1. The core mechanism — two independent layers

The redirect only works if these two layers are understood as **separate**:

1. **DNS layer** — where `vishvavahini.com` *points*. Today it points to **Wix**, so Wix serves
   every request and our redirect never runs.
2. **Application layer** — the `next.config.ts` host redirect
   (`host = vishvavahini.com → https://vishtv.com/:path*`) only fires **once a request reaches the
   Vercel app**.

**The cutover is fundamentally a DNS move.** Repointing `vishvavahini.com` DNS from Wix to Vercel
is what activates the ~2,481 redirects already coded. Until DNS moves, nothing changes for visitors.

---

## 2. Recommended strategy: DNS repoint + app-level 301s

Do **not** use Wix's redirect manager — it is per-URL, unusable for ~2,481 posts, and would force
Wix to stay live and paid indefinitely. Instead, **point the domain at Vercel and let the app do the
redirecting.** Wix becomes irrelevant the moment DNS flips.

Redirects already implemented in `next.config.ts`:

| Old (Wix) URL | New (VishTV) URL |
|---|---|
| `vishvavahini.com/*`, `www.vishvavahini.com/*` | `https://vishtv.com/*` (path preserved) |
| `/post/<slug>` | `/news/<slug>` (slugs match — preserves ~2,481 indexed article URLs) |
| `/all-news` | `/news` |
| `/tv-live` | `/watch` |
| `/teledrama`, `/movies` | `/browse` |
| `/event-list` | `/events` |
| `/privacy-policy` | `/privacy` |

All are **301 (permanent)** so Google transfers ranking to the new URLs.

---

## 2a. Sequencing & timing — launch first, then migrate (do NOT do both at once)

The professional approach is **a sequence, not an either/or**: publish `vishtv.com` first and run
in parallel, then flip the redirect, then decommission Wix.

1. **Launch `vishtv.com` first — Wix untouched (parallel / soft launch).** New site runs under real
   production conditions with **zero risk** to the old site's traffic or rankings.
2. **Verify in production for a short, bracketed window** (a few days to ~1 week): content,
   performance, Vercel logs, crons, `/studio`, live stream, analytics.
3. **Cutover** — repoint `vishvavahini.com` DNS to Vercel; 301s activate; do GSC Change of Address.
4. **Keep Wix dormant (30–90 days), then decommission** (after securing domain + backups).

**Why not the two extremes:**

- **Do NOT cut over on launch day.** If a production-only bug surfaces (env, SSL, data), you break
  the new site *and* the old site's traffic/SEO at once, with a painful rollback. Never migrate
  traffic to a site you haven't watched run in production.
- **Do NOT run both in parallel indefinitely.** Two live domains serving the same ~2,481 articles =
  **duplicate content** — Google splits/erodes rankings and can't tell which is canonical. Parallel
  is a *bracketed staging phase*, not a permanent state.

**The one caveat during the parallel window:** because `vishtv.com` is indexable, a long overlap
risks duplicate content. Either keep the window **short** (days — low risk, Google re-crawls slowly),
or for a **longer** bake, **hold off submitting `vishtv.com` to Google** (no sitemap submission / no
index request) until cutover so it doesn't compete with the still-ranking old site. Since dev already
runs on the production dataset, confidence is high — a short window is the pragmatic choice.

**Bottom line:** publish first + run parallel as a short, deliberate verification bridge; flip the
redirect once confident; then wind Wix down.

## 3. Cutover runbook

### Phase 0 — Prerequisites (before touching DNS)
1. Merge the release PR → production deploy live; confirm **`vishtv.com` serves the new site**
   (custom domain added on Vercel, SSL green).
2. Spot-check redirects against `vishtv.com` (e.g. `vishtv.com/post/<slug>` → `/news/<slug>`).
3. **Lower the DNS TTL** on `vishvavahini.com` records to 300s a day ahead, for fast propagation.

### Phase 1 — Flip the domain
4. In Vercel, add **`vishvavahini.com`** and **`www.vishvavahini.com`** as domains on the project.
5. At the DNS host for `vishvavahini.com`, repoint to Vercel (removing the Wix pointing):
   - `A  @   → 76.76.21.21`
   - `CNAME  www → cname.vercel-dns.com`
6. Wait for propagation + Vercel SSL provisioning (minutes). Vercel now serves the domain and the
   host redirect fires.

### Phase 2 — Verify
7. Test: `https://www.vishvavahini.com/post/<slug>` → **301** → `https://vishtv.com/news/<slug>`;
   check root, `/all-news`, `/tv-live`, `/teledrama`.
8. Confirm HTTPS works on the old domain (no cert warnings).

### Phase 2b — Turn indexing on (at cutover, not before)
8a. Set **`ALLOW_INDEXING=true`** in Vercel (Production env) → **redeploy** production. This flips
    `robots.txt` to allow crawling and removes the site-wide `<meta noindex>`. Do this only when
    you're ready for Google to index `vishtv.com` (i.e. at cutover, alongside the DNS repoint).

### Phase 3 — SEO handoff (promptly after cutover)
9. **Google Search Console**: verify both `vishvavahini.com` and `vishtv.com` properties, then use
   the **"Change of Address"** tool (old → new). Biggest single accelerator for transferring rankings.
10. Submit `https://vishtv.com/sitemap.xml` in GSC.
11. **Keep the 301s in place indefinitely** (min. 6–12 months; ideally forever) so old inbound links
    and Google's cache keep resolving.

---

## 4. ⚠️ Before taking Wix down — three risks that can bite hard

1. **DOMAIN OWNERSHIP (critical).** If `vishvavahini.com` is *registered through Wix*, cancelling
   the Wix plan can **release the domain**. Confirm where it is registered. If on Wix: transfer the
   domain out to a standalone registrar (Cloudflare / Namecheap) first, or keep a domain-only plan.
   **Never cancel Wix until the domain is provably secured elsewhere.**
2. **UNMIGRATED DATA.** The 2,481 articles + videos were migrated. **Not** migrated: Wix **member
   accounts, comments, likes, ratings, contact-form submissions.** If any matters, **export/back it
   up from Wix before takedown** — it is lost once the plan lapses.
3. **ROLLBACK SAFETY.** Do not delete Wix immediately. After DNS moves, Wix receives no traffic
   (it goes "dark"). Keep it **dormant ~30–90 days** as a rollback option and until GSC shows the
   migration has settled. Then downgrade to domain-only or cancel.

---

## 5. Redirect-chain nuance

Old deep links currently take a **2-hop 301 chain**
(`vishvavahini.com/post/x` → `vishvavahini.com/news/x` → `vishtv.com/news/x`) unless the one-hop
host-specific rules are enabled. Google follows and consolidates 2-hop chains fine, so this is
SEO-acceptable. The one-hop rules (`vishvavahini.com/post/:slug` → `vishtv.com/news/:slug` directly)
are the cleanest option and can be enabled in `next.config.ts`.

---

## 6. Suggested timeline

| When | Action |
|---|---|
| Now | Merge PR → verify `vishtv.com` |
| T+0 (cutover day) | Phase 1–2: DNS flip + verify |
| T+0–2 days | Phase 3: GSC Change of Address, submit sitemap |
| T+2–4 weeks | Monitor GSC; confirm rankings transferring, no crawl errors |
| T+30–90 days | After securing domain + backups, take Wix down |

---

## 7. Pre-flight checklist

- [x] `vishtv.com` live on Vercel with valid SSL (non-indexed soft launch)
- [x] `vishtv.com` DNS pointed to Vercel (Hostinger: A → 216.198.79.1, www CNAME → Vercel)
- [x] `SANITY_API_READ_TOKEN` scoped to Production; production reads content
- [x] Redirects verified (one-hop) for old Wix paths
- [ ] Bake period on `vishtv.com` (a few days; watch logs, confirm crons)
- [ ] `ALLOW_INDEXING=true` set + redeploy (turn indexing on — at cutover)
- [ ] DNS TTL lowered on `vishvavahini.com`
- [ ] `vishvavahini.com` + `www` added as Vercel domains
- [ ] **Domain secured off Wix (it's on Wix nameservers — confirm registrar / transfer out)**
- [ ] Wix member/comment/form data exported (if needed)
- [ ] `vishvavahini.com` DNS repointed to Vercel (in Wix DNS panel)
- [ ] Old→new 301s verified live from `vishvavahini.com`
- [ ] GSC Change of Address submitted + sitemap submitted
- [ ] Wix kept dormant (rollback window), then decommissioned
