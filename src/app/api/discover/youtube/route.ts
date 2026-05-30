import { NextRequest } from "next/server";
import { refreshYouTubeIfNeeded } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic")?.trim();
  if (!topic) return Response.json({ error: "topic required" }, { status: 400 });

  const accessToken = await refreshYouTubeIfNeeded();
  if (!accessToken) {
    return Response.json({ error: "YouTube not connected" }, { status: 401 });
  }

  const auth = { Authorization: `Bearer ${accessToken}` };
  const q = encodeURIComponent(topic);

  const [channelRes, videoRes] = await Promise.all([
    fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=channel&maxResults=6&order=relevance`,
      { headers: auth }
    ),
    fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=8&order=viewCount`,
      { headers: auth }
    ),
  ]);

  const [channelData, videoData] = await Promise.all([channelRes.json(), videoRes.json()]);

  const channelIds = (channelData.items ?? []).map((i: any) => i.id.channelId).join(",");
  const videoIds = (videoData.items ?? []).map((i: any) => i.id.videoId).join(",");

  const [chStatsRes, vStatsRes] = await Promise.all([
    channelIds
      ? fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}`, { headers: auth })
      : null,
    videoIds
      ? fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}`, { headers: auth })
      : null,
  ]);

  const chStats: Record<string, any> = {};
  if (chStatsRes?.ok) {
    const d = await chStatsRes.json();
    d.items?.forEach((item: any) => { chStats[item.id] = item.statistics; });
  }

  const vStats: Record<string, any> = {};
  if (vStatsRes?.ok) {
    const d = await vStatsRes.json();
    d.items?.forEach((item: any) => { vStats[item.id] = item.statistics; });
  }

  const channels = (channelData.items ?? []).map((i: any) => ({
    title: i.snippet.channelTitle,
    description: i.snippet.description,
    channelId: i.id.channelId,
    url: `https://youtube.com/channel/${i.id.channelId}`,
    thumbnail: i.snippet.thumbnails?.default?.url,
    subscribers: chStats[i.id.channelId]?.subscriberCount,
    videoCount: chStats[i.id.channelId]?.videoCount,
  }));

  const videos = (videoData.items ?? []).map((i: any) => ({
    title: i.snippet.title,
    channelTitle: i.snippet.channelTitle,
    videoId: i.id.videoId,
    url: `https://youtube.com/watch?v=${i.id.videoId}`,
    thumbnail: i.snippet.thumbnails?.medium?.url,
    publishedAt: i.snippet.publishedAt,
    views: vStats[i.id.videoId]?.viewCount,
    likes: vStats[i.id.videoId]?.likeCount,
  }));

  return Response.json({ channels, videos });
}
