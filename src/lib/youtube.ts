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

/** Check if the channel is currently live streaming */
export async function getLiveStreamStatus(): Promise<{
  isLive: boolean;
  videoId: string | null;
  title: string | null;
  viewerCount: number | null;
}> {
  if (!API_KEY) return { isLive: false, videoId: null, title: null, viewerCount: null };

  const params = new URLSearchParams({
    part: "snippet",
    channelId: CHANNEL_ID,
    eventType: "live",
    type: "video",
    key: API_KEY,
  });

  const res = await fetch(`${API_BASE}/search?${params}`);
  if (!res.ok) return { isLive: false, videoId: null, title: null, viewerCount: null };

  const data = await res.json();
  const liveItem = data.items?.[0];

  if (!liveItem) {
    return { isLive: false, videoId: null, title: null, viewerCount: null };
  }

  // Fetch viewer count for the live video
  const video = await getVideoById(liveItem.id.videoId);

  return {
    isLive: true,
    videoId: liveItem.id.videoId,
    title: liveItem.snippet.title,
    viewerCount: video?.viewCount || null,
  };
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
