import { createClient } from "@sanity/client";

const {
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_ID,
  NEXT_PUBLIC_SANITY_PROJECT_ID,
  SANITY_API_TOKEN,
} = process.env;

const datasetArg = process.argv[2];
const dataset = datasetArg || process.env.NEXT_PUBLIC_SANITY_DATASET || "development";

if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY missing");
if (!YOUTUBE_CHANNEL_ID) throw new Error("YOUTUBE_CHANNEL_ID missing");
if (!NEXT_PUBLIC_SANITY_PROJECT_ID) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID missing");
if (!SANITY_API_TOKEN) throw new Error("SANITY_API_TOKEN missing");

const client = createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  token: SANITY_API_TOKEN,
  apiVersion: "2024-03-01",
  useCdn: false,
});

const API = "https://www.googleapis.com/youtube/v3";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${url}\n${text}`);
  }
  return res.json();
}

async function getUploadsPlaylistId() {
  const data = await fetchJson(
    `${API}/channels?part=contentDetails&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
  );
  const id = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!id) throw new Error(`No uploads playlist for channel ${YOUTUBE_CHANNEL_ID}`);
  return id;
}

async function* iterPlaylistVideoIds(playlistId) {
  let pageToken = "";
  while (true) {
    const params = new URLSearchParams({
      part: "contentDetails",
      playlistId,
      maxResults: "50",
      key: YOUTUBE_API_KEY,
      ...(pageToken ? { pageToken } : {}),
    });
    const data = await fetchJson(`${API}/playlistItems?${params}`);
    for (const item of data.items || []) {
      const id = item.contentDetails?.videoId;
      if (id) yield id;
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
}

async function fetchVideoBatch(videoIds) {
  const params = new URLSearchParams({
    part: "snippet,contentDetails,statistics",
    id: videoIds.join(","),
    key: YOUTUBE_API_KEY,
  });
  const data = await fetchJson(`${API}/videos?${params}`);
  return data.items || [];
}

function toSanityDoc(item) {
  const thumb =
    item.snippet.thumbnails?.maxres?.url ||
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.medium?.url ||
    item.snippet.thumbnails?.default?.url ||
    null;
  return {
    _id: `video-${item.id}`,
    _type: "video",
    title: item.snippet.title,
    youtubeId: item.id,
    youtubeUrl: `https://www.youtube.com/watch?v=${item.id}`,
    description: item.snippet.description || "",
    thumbnailUrl: thumb,
    publishedAt: item.snippet.publishedAt,
    language: "si",
    isFeatured: false,
  };
}

const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n)
  );

async function main() {
  console.log(`→ Sanity dataset: ${dataset}`);
  console.log(`→ Channel: ${YOUTUBE_CHANNEL_ID}`);

  const playlistId = await getUploadsPlaylistId();
  console.log(`→ Uploads playlist: ${playlistId}`);

  const allIds = [];
  for await (const id of iterPlaylistVideoIds(playlistId)) {
    allIds.push(id);
  }
  console.log(`→ Found ${allIds.length} videos on YouTube`);

  if (allIds.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  const batches = chunk(allIds, 50);
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, batch] of batches.entries()) {
    const items = await fetchVideoBatch(batch);
    const tx = client.transaction();
    for (const item of items) {
      tx.createIfNotExists(toSanityDoc(item));
    }
    try {
      const result = await tx.commit({ visibility: "async" });
      const newCreates = result.results.filter((r) => r.operation === "create").length;
      created += newCreates;
      skipped += items.length - newCreates;
      console.log(
        `  batch ${i + 1}/${batches.length}: +${newCreates} new, ${items.length - newCreates} already there`
      );
    } catch (err) {
      failed += items.length;
      console.error(`  batch ${i + 1}/${batches.length}: failed —`, err.message);
    }
  }

  console.log(`\nDone. created=${created} skipped=${skipped} failed=${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
