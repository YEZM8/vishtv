# VishTV Content Manager Guide

Welcome! This guide shows you how to manage content on vishtv.com using Sanity Studio.

---

## Getting Started

1. Open **Sanity Studio** at: `https://vishtv.com/studio`
2. Log in with your Sanity account
3. You'll see the content menu on the left sidebar

---

## Content Types

### 📰 News Articles

**To add a news article:**
1. Click **News** in the sidebar
2. Click the **+ Create** button (top right)
3. Fill in:
   - **Title** — The headline (required)
   - **Slug** — Auto-generated from title. Click "Generate" if empty
   - **Featured Image** — Upload or drag-drop an image (recommended: 1200x630px)
   - **Category** — Select a category (e.g., Politics, Business, Sport)
   - **Author** — Writer name (defaults to "News Room")
   - **Language** — English or Sinhala
   - **Body** — Write your article using the rich text editor
     - Use the toolbar for **bold**, *italic*, headings, links
     - Click the **+** button to add images or YouTube videos inline
4. Click **Publish** (bottom right)

### 🎬 Videos

Videos are automatically synced from YouTube every 6 hours. But you can also add them manually:

1. Click **Videos** in the sidebar
2. Click **+ Create**
3. Paste the **YouTube URL** — the video ID and thumbnail are extracted automatically
4. Optionally set:
   - **Programme** — Which show this belongs to
   - **Category** — Content category
   - **Featured** — Toggle ON to show in the Featured row on the homepage
   - **Language** — English or Sinhala

### 📺 Programmes (Shows)

1. Click **Programmes** in the sidebar
2. Click **+ Create**
3. Fill in:
   - **Title** — Show name
   - **Slug** — Auto-generated
   - **Poster** — Portrait image (2:3 ratio, e.g., 400x600px) for browse grid
   - **Thumbnail** — Landscape image (16:9, e.g., 1280x720px)
   - **Description** — Brief show description
   - **Category** — Select category
   - **Active** — Toggle ON to show on the website

### 📅 Events

1. Click **Events** in the sidebar
2. Click **+ Create**
3. Fill in:
   - **Title** — Event name
   - **Image** — Event poster/banner
   - **Date** — Event date and time
   - **Ticket URL** — Link to ticket purchase (optional)
   - **Description** — Event details
   - **Active** — Toggle ON to show on the website

### 🗓️ Schedule

1. Click **Schedule** in the sidebar
2. Find today's date or create a new schedule
3. Add **time slots**:
   - **Time** — e.g., "19:00" (24-hour format)
   - **Programme** — Select the show
   - **Episode Title** — Optional specific episode name
   - **Live** — Toggle ON if this slot is currently live

### ⚙️ Site Settings

This controls global website settings. Click **Site Settings** in the sidebar:

- **Live Stream Video ID** — YouTube video ID for the "Watch Live" page (e.g., `dQw4w9WgXcQ`)
- **Radio Stream URL** — Audio stream URL for the radio page
- **Hero Headline** — Main homepage headline text
- **Hero Subline** — Subtitle below the headline
- **Contact Email** — Shown on the Contact page
- **Contact Phone** — Shown on the Contact page
- **Social Links** — Facebook and YouTube URLs
- **Announcement Bar** — Optional banner shown at the top of the site

---

## Tips

- **Save as Draft** — Use this to work on content without publishing it
- **Preview** — Content updates appear on the website within ~60 seconds of publishing
- **Images** — Always add alt text for accessibility
- **YouTube Videos** — Just paste the full YouTube URL, the system extracts the ID automatically
- **Categories** — Create categories first (under **Categories** in sidebar), then assign them to content
- **Search** — Use the search bar at the top to find any content

---

## Common Tasks

| Task | Steps |
|------|-------|
| Go live with a stream | Site Settings → update Live Stream Video ID → Publish |
| Feature a video on homepage | Videos → find video → toggle Featured ON → Publish |
| Add tonight's schedule | Schedule → today's date → add time slots → Publish |
| Post breaking news | News → Create → write article → Publish |
| Hide an old event | Events → find event → toggle Active OFF → Publish |

---

## Need Help?

Contact your website administrator for technical support.
