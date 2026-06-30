# VishTV Launch Checklist

## Pre-Launch

### CMS / Sanity Plan (decided)
- **Decision:** Sanity is the CMS (already embedded at `/studio`). **Launch on the FREE tier.**
  - Content fits comfortably: ~1,900 docs vs 10,000 cap; images ~1–3 GB vs 100 GB; YouTube
    embeds cost zero storage. API/bandwidth well within free limits.
  - Free tier caveats: only **Admin + Viewer** roles (no granular Contributor/Editor), and the
    dataset is **public** (published content anonymously queryable — fine for a public news site).
- [ ] Add each content manager as an **Admin** seat in the Sanity project (Free tier has no
      lesser write role; team must be trusted).
- **Upgrade trigger → Growth ($15/seat/mo):** when you need role separation (contributors who
  aren't full Admins), an approval/publish workflow, a private dataset, or you approach the
  100 GB/mo bandwidth ceiling. No migration needed — it's a billing flip on the same project.
- [ ] (Phase 2) Budget ~$15–75/mo Growth line item for when the editorial team formalizes.

### Environment & Config
- [ ] Set all environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET` (production)
  - `SANITY_API_TOKEN` (write token for sync)
  - `YOUTUBE_API_KEY`
  - `YOUTUBE_CHANNEL_ID`
  - `CRON_SECRET` (random string for cron auth)
- [ ] Verify Sanity project ID and dataset are correct
- [ ] Test YouTube API key works (check `/api/sync-youtube`)

### Content
- [ ] Add at least 3-5 news articles in Sanity
- [ ] Add all active programmes with poster images
- [ ] Set up tonight's schedule
- [ ] Configure Site Settings (live stream ID, contact info, socials)
- [ ] Verify featured videos are marked

### Testing
- [ ] Test all pages load correctly on desktop and mobile
- [ ] Test language toggle switches between EN and Sinhala
- [ ] Test Watch page plays YouTube videos
- [ ] Test Radio page (if stream URL configured)
- [ ] Test Sanity Studio at `/studio` — create and publish test content
- [ ] Verify content appears on site within 60 seconds of publishing
- [ ] Test TV mode with `?tv=1` query param

### Performance
- [ ] Run Lighthouse audit — target 90+ on Performance, Accessibility
- [ ] Verify images load with correct sizes (no oversized downloads)
- [ ] Confirm ISR is working (pages revalidate every 60s)

---

## DNS Cutover

### vishtv.com (Primary Domain)
1. In your domain registrar, point DNS to Vercel:
   - `A` record → `76.76.21.21`
   - `CNAME` for `www` → `cname.vercel-dns.com`
2. In Vercel dashboard: Add `vishtv.com` as custom domain
3. Vercel will auto-provision SSL certificate

### vishvavahini.com (Redirect)
1. Point DNS to Vercel (same A/CNAME records)
2. In Vercel dashboard: Add `vishvavahini.com` as alias
3. Next.js config already handles 301 redirects to `vishtv.com`

---

## Post-Launch

### Day 1
- [ ] Verify site is live at vishtv.com
- [ ] Verify vishvavahini.com redirects to vishtv.com
- [ ] Check Vercel Analytics dashboard for traffic
- [ ] Run YouTube sync manually once: `curl -H "Authorization: Bearer $CRON_SECRET" https://vishtv.com/api/sync-youtube`
- [ ] Verify cron job is registered in Vercel dashboard

### Week 1
- [ ] Monitor Vercel Analytics for errors and performance
- [ ] Check Speed Insights for Core Web Vitals
- [ ] Review content manager workflow — any pain points?
- [ ] Verify YouTube auto-sync is running (check Vercel cron logs)

### Ongoing
- [ ] Monitor analytics monthly
- [ ] Review and update content regularly
- [ ] Keep dependencies updated (`npm audit`, `npm update`)
