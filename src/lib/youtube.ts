/**
 * YouTube Data API v3 helpers
 *
 * Used for:
 * 1. Auto-syncing channel videos to Sanity
 * 2. Checking live stream status
 * 3. Fetching video metadata from URLs
 */

const API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UCeqWSlqqNO2F5zPWq-pQEcA";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration?: string;
  viewCount?: number;
  isLive?: boolean;
}

/** Extract video ID from various YouTube URL formats */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // bare ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Fetch metadata for a single video by ID */
export async function getVideoById(videoId: string): Promise<YouTubeVideo | null> {
  if (!API_KEY) return null;

  const params = new URLSearchParams({
    part: "snippet,contentDetails,statistics,liveStreamingDetails",
    id: videoId,
    key: API_KEY,
  });

  const res = await fetch(`${API_BASE}/videos?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl:
      item.snippet.thumbnails?.maxres?.url ||
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails?.duration,
    viewCount: Number(item.statistics?.viewCount) || 0,
    isLive: item.snippet.liveBroadcastContent === "live",
  };
}

/** Fetch recent videos from the channel's uploads playlist */
export async function getChannelVideos(maxResults = 20): Promise<YouTubeVideo[]> {
  if (!API_KEY) return [];

  // First, get the uploads playlist ID
  const channelParams = new URLSearchParams({
    part: "contentDetails",
    id: CHANNEL_ID,
    key: API_KEY,
  });

  const channelRes = await fetch(`${API_BASE}/channels?${channelParams}`);
  if (!channelRes.ok) return [];

  const channelData = await channelRes.json();
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return [];

  // Fetch playlist items
  const playlistParams = new URLSearchParams({
    part: "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: String(maxResults),
    key: API_KEY,
  });

  const playlistRes = await fetch(`${API_BASE}/playlistItems?${playlistParams}`);
  if (!playlistRes.ok) return [];

  const playlistData = await playlistRes.json();
  const videoIds = playlistData.items
    ?.map((item: { snippet?: { resourceId?: { videoId?: string } } }) =>
      item.snippet?.resourceId?.videoId
    )
    .filter(Boolean)
    .join(",");

  if (!videoIds) return [];

  // Batch fetch video details (1 API unit for up to 50 videos)
  const videosParams = new URLSearchParams({
    part: "snippet,contentDetails,statistics,liveStreamingDetails",
    id: videoIds,
    key: API_KEY,
  });

  const videosRes = await fetch(`${API_BASE}/videos?${videosParams}`);
  if (!videosRes.ok) return [];

  const videosData = await videosRes.json();
  return (videosData.items || []).map(
    (item: {
      id: string;
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        liveBroadcastContent: string;
        thumbnails: Record<string, { url: string }>;
      };
      contentDetails?: { duration?: string };
      statistics?: { viewCount?: string };
    }) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl:
        item.snippet.thumbnails?.maxres?.url ||
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url,
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails?.duration,
      viewCount: Number(item.statistics?.viewCount) || 0,
      isLive: item.snippet.liveBroadcastContent === "live",
    })
  );
}

/**
 * Fetch current view counts for many videos at once.
 * Returns Map<youtubeId, viewCount>. Batches into groups of 50 (YouTube API limit).
 */
export async function getVideosStatistics(
  videoIds: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (!API_KEY || videoIds.length === 0) return result;

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: "statistics",
      id: batch.join(","),
      key: API_KEY,
    });
    const res = await fetch(`${API_BASE}/videos?${params}`);
    if (!res.ok) continue;
    const data = await res.json();
    for (const item of data.items || []) {
      result.set(item.id, Number(item.statistics?.viewCount) || 0);
    }
  }
  return result;
}

/**
 * Check if the channel is currently live streaming.
 *
 * Uses the channel's recent uploads (videos.list liveStreamingDetails) rather than
 * search?eventType=live. That endpoint is cheap (~3 quota units vs 100 for search) and far more
 * reliable — search has significant live-indexing lag and can miss active broadcasts, which is
 * what caused the "off air" false negative in production.
 */
export async function getLiveStreamStatus(): Promise<{
  isLive: boolean;
  videoId: string | null;
  title: string | null;
  viewerCount: number | null;
}> {
  const offline = { isLive: false, videoId: null, title: null, viewerCount: null };
  if (!API_KEY) return offline;

  try {
    // uploads playlist id
    const chRes = await fetch(
      `${API_BASE}/channels?${new URLSearchParams({ part: "contentDetails", id: CHANNEL_ID, key: API_KEY })}`
    );
    if (!chRes.ok) return offline;
    const chData = await chRes.json();
    const uploads =
      chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) return offline;

    // most recent uploads (a live broadcast appears here)
    const plRes = await fetch(
      `${API_BASE}/playlistItems?${new URLSearchParams({ part: "contentDetails", playlistId: uploads, maxResults: "10", key: API_KEY })}`
    );
    if (!plRes.ok) return offline;
    const plData = await plRes.json();
    const ids: string = (plData.items || [])
      .map((i: { contentDetails?: { videoId?: string } }) => i.contentDetails?.videoId)
      .filter(Boolean)
      .join(",");
    if (!ids) return offline;

    // find one that is currently live
    const vRes = await fetch(
      `${API_BASE}/videos?${new URLSearchParams({ part: "snippet,liveStreamingDetails", id: ids, key: API_KEY })}`
    );
    if (!vRes.ok) return offline;
    const vData = await vRes.json();
    const live = (vData.items || []).find(
      (v: {
        snippet?: { liveBroadcastContent?: string };
        liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string };
      }) =>
        v.snippet?.liveBroadcastContent === "live" ||
        (v.liveStreamingDetails?.actualStartTime &&
          !v.liveStreamingDetails?.actualEndTime)
    );
    if (!live) return offline;

    return {
      isLive: true,
      videoId: live.id,
      title: live.snippet?.title ?? null,
      viewerCount: Number(live.liveStreamingDetails?.concurrentViewers) || null,
    };
  } catch {
    return offline;
  }
}

/** Generate a YouTube thumbnail URL from a video ID */
export function getThumbnailUrl(
  videoId: string,
  quality: "default" | "medium" | "high" | "maxres" = "high"
): string {
  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    maxres: "maxresdefault",
  };
  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/** Generate a YouTube embed URL */
export function getEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    ...(autoplay ? { autoplay: "1" } : {}),
  });
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}
