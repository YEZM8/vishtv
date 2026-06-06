import { createClient } from "@sanity/client";

const dataset = process.argv[2] || process.env.NEXT_PUBLIC_SANITY_DATASET || "development";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2024-03-01",
  useCdn: false,
});

const SPLIT_PATTERN = /[|—]/;
const MIN_VIDEOS_PER_PROGRAMME = 5;
const SKIP = new Set(["Vishvavahini TV", "News"]);

function slugify(text, fallbackIndex) {
  const ascii = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || `programme-${fallbackIndex}`;
}

async function main() {
  console.log(`→ Sanity dataset: ${dataset}`);

  const videos = await client.fetch(
    `*[_type == "video"]{ _id, title, programme }`
  );
  console.log(`→ Loaded ${videos.length} videos`);

  // Detect programmes from titles
  const programmeBuckets = new Map();
  for (const v of videos) {
    const firstSeg = (v.title || "").split(SPLIT_PATTERN)[0].trim();
    if (!firstSeg || SKIP.has(firstSeg)) continue;
    if (!programmeBuckets.has(firstSeg)) programmeBuckets.set(firstSeg, []);
    programmeBuckets.get(firstSeg).push(v._id);
  }

  // Keep only programmes with ≥ MIN videos
  const programmes = Array.from(programmeBuckets.entries())
    .filter(([, vids]) => vids.length >= MIN_VIDEOS_PER_PROGRAMME)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(`→ ${programmes.length} programmes have ≥${MIN_VIDEOS_PER_PROGRAMME} videos`);

  let programmesCreated = 0;
  let programmesSkipped = 0;
  let videosLinked = 0;

  for (const [index, [title, videoIds]] of programmes.entries()) {
    const slug = slugify(title, index + 1);
    const docId = `programme-${slug}`;

    // Create programme (idempotent)
    try {
      const result = await client.createIfNotExists({
        _id: docId,
        _type: "programme",
        title,
        slug: { _type: "slug", current: slug },
        isActive: true,
      });
      if (result._createdAt === result._updatedAt) {
        programmesCreated++;
        console.log(`  + programme: ${title} (${videoIds.length} videos) → /browse/${slug}`);
      } else {
        programmesSkipped++;
      }
    } catch (err) {
      console.error(`  ! failed to create programme ${title}:`, err.message);
      continue;
    }

    // Batch-link videos in transactions of 50
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const tx = client.transaction();
      for (const vid of batch) {
        tx.patch(vid, (p) =>
          p.setIfMissing({
            programme: { _type: "reference", _ref: docId },
          })
        );
      }
      try {
        await tx.commit({ visibility: "async" });
        videosLinked += batch.length;
      } catch (err) {
        console.error(`  ! batch link failed for ${title}:`, err.message);
      }
    }
  }

  const unlinked = videos.length - videosLinked;
  console.log(
    `\nDone. programmesCreated=${programmesCreated} programmesSkipped=${programmesSkipped} ` +
    `videosLinked=${videosLinked} videosUnlinked≈${unlinked}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
