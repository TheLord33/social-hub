import { getToken, refreshTwitterIfNeeded, refreshTikTokIfNeeded, refreshRedditIfNeeded } from "./tokens";
import { MediaType } from "./compatibility";

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface PublishRequest {
  content: string;
  platforms: string[];
  mediaType?: MediaType;
  mediaUrl?: string;
  redditSubreddit?: string;
  redditTitle?: string;
}

// ─── Twitter ──────────────────────────────────────────────────────────────────

async function postToTwitter(content: string, mediaType: MediaType, mediaUrl?: string): Promise<PostResult> {
  const accessToken = await refreshTwitterIfNeeded();
  if (!accessToken) return { platform: "twitter", success: false, error: "Not connected" };

  const text = mediaType !== "text" && mediaUrl ? `${content}\n\n${mediaUrl}`.trim() : content;

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    return { platform: "twitter", success: false, error: err.detail ?? res.statusText };
  }

  const data = await res.json();
  const postId = data.data?.id;
  const token = getToken("twitter");
  return {
    platform: "twitter", success: true, postId,
    postUrl: postId && token?.username ? `https://twitter.com/${token.username}/status/${postId}` : undefined,
  };
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

async function postToFacebook(content: string, mediaType: MediaType, mediaUrl?: string): Promise<PostResult> {
  const t = getToken("facebook");
  if (!t) return { platform: "facebook", success: false, error: "Not connected" };

  let endpoint: string;
  let body: Record<string, string>;

  if (mediaType === "video" && mediaUrl) {
    endpoint = `https://graph.facebook.com/v18.0/${t.pageId}/videos`;
    body = { description: content, file_url: mediaUrl, access_token: t.pageAccessToken };
  } else if (mediaType === "image" && mediaUrl) {
    endpoint = `https://graph.facebook.com/v18.0/${t.pageId}/photos`;
    body = { message: content, url: mediaUrl, access_token: t.pageAccessToken };
  } else {
    endpoint = `https://graph.facebook.com/v18.0/${t.pageId}/feed`;
    body = { message: content, access_token: t.pageAccessToken };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    return { platform: "facebook", success: false, error: err.error?.message ?? res.statusText };
  }

  const data = await res.json();
  return { platform: "facebook", success: true, postId: data.id, postUrl: data.id ? `https://www.facebook.com/${data.id}` : undefined };
}

// ─── Instagram ────────────────────────────────────────────────────────────────

async function postToInstagram(content: string, mediaType: MediaType, mediaUrl?: string): Promise<PostResult> {
  const t = getToken("instagram");
  if (!t) return { platform: "instagram", success: false, error: "Not connected" };

  if (mediaType === "text" || !mediaUrl) {
    return { platform: "instagram", success: false, error: "Instagram requires an image or video URL." };
  }

  const containerBody = mediaType === "video"
    ? { media_type: "REELS", video_url: mediaUrl, caption: content, access_token: t.pageAccessToken }
    : { image_url: mediaUrl, caption: content, access_token: t.pageAccessToken };

  const containerRes = await fetch(`https://graph.facebook.com/v18.0/${t.igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(containerBody),
  });

  if (!containerRes.ok) {
    const err = await containerRes.json().catch(() => ({ error: { message: containerRes.statusText } }));
    return { platform: "instagram", success: false, error: err.error?.message ?? containerRes.statusText };
  }

  const { id: containerId } = await containerRes.json();
  const publishRes = await fetch(`https://graph.facebook.com/v18.0/${t.igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: containerId, access_token: t.pageAccessToken }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.json().catch(() => ({ error: { message: publishRes.statusText } }));
    return { platform: "instagram", success: false, error: err.error?.message ?? publishRes.statusText };
  }

  const { id: postId } = await publishRes.json();
  return { platform: "instagram", success: true, postId, postUrl: `https://www.instagram.com/p/${postId}/` };
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

async function postToLinkedIn(content: string, mediaType: MediaType, mediaUrl?: string): Promise<PostResult> {
  const t = getToken("linkedin");
  if (!t) return { platform: "linkedin", success: false, error: "Not connected" };

  if (mediaType === "video") {
    return { platform: "linkedin", success: false, error: "LinkedIn video requires binary asset upload, which isn't supported yet." };
  }

  const shareContent = mediaType === "image" && mediaUrl
    ? { shareCommentary: { text: content }, shareMediaCategory: "ARTICLE", media: [{ status: "READY", originalUrl: mediaUrl }] }
    : { shareCommentary: { text: content }, shareMediaCategory: "NONE" };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: t.personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: { "com.linkedin.ugc.ShareContent": shareContent },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    return { platform: "linkedin", success: false, error: err.message ?? res.statusText };
  }

  return { platform: "linkedin", success: true, postId: res.headers.get("x-restli-id") ?? "" };
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

async function postToTikTok(content: string, mediaUrl?: string): Promise<PostResult> {
  const accessToken = await refreshTikTokIfNeeded();
  if (!accessToken) return { platform: "tiktok", success: false, error: "Not connected" };

  if (!mediaUrl) return { platform: "tiktok", success: false, error: "TikTok requires a video URL." };

  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      post_info: {
        title: content.slice(0, 2200),
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: { source: "PULL_FROM_URL", video_url: mediaUrl },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    return { platform: "tiktok", success: false, error: err.error?.message ?? res.statusText };
  }

  const data = await res.json();
  return { platform: "tiktok", success: true, postId: data.data?.publish_id };
}

// ─── Reddit ───────────────────────────────────────────────────────────────────

async function postToReddit(
  content: string,
  mediaType: MediaType,
  mediaUrl: string | undefined,
  subreddit: string,
  title: string
): Promise<PostResult> {
  const accessToken = await refreshRedditIfNeeded();
  if (!accessToken) return { platform: "reddit", success: false, error: "Not connected" };

  const sr = subreddit.replace(/^\/?r\//, "").trim();
  if (!sr) return { platform: "reddit", success: false, error: "Subreddit is required." };
  if (!title.trim()) return { platform: "reddit", success: false, error: "Title is required." };

  const kind = mediaType === "text" ? "self" : "link";
  const bodyParams: Record<string, string> = kind === "self" ? { text: content } : { url: mediaUrl ?? content };

  const res = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "web:socialhub:1.0.0",
    },
    body: new URLSearchParams({ sr, kind, title, resubmit: "true", nsfw: "false", ...bodyParams }),
  });

  const data = await res.json();
  if (!res.ok || data.success === false || data.json?.errors?.length) {
    const msg = data.json?.errors?.[0]?.[1] ?? data.message ?? "Failed to post";
    return { platform: "reddit", success: false, error: msg };
  }

  return { platform: "reddit", success: true, postId: data.json?.data?.id, postUrl: data.json?.data?.url };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function publishAll(req: PublishRequest): Promise<PostResult[]> {
  const { content, platforms, mediaType = "text", mediaUrl, redditSubreddit = "", redditTitle = "" } = req;

  const jobs: Promise<PostResult>[] = [];

  if (platforms.includes("twitter"))   jobs.push(postToTwitter(content, mediaType, mediaUrl));
  if (platforms.includes("facebook"))  jobs.push(postToFacebook(content, mediaType, mediaUrl));
  if (platforms.includes("instagram")) jobs.push(postToInstagram(content, mediaType, mediaUrl));
  if (platforms.includes("linkedin"))  jobs.push(postToLinkedIn(content, mediaType, mediaUrl));
  if (platforms.includes("tiktok"))    jobs.push(postToTikTok(content, mediaUrl));
  if (platforms.includes("reddit"))    jobs.push(postToReddit(content, mediaType, mediaUrl, redditSubreddit, redditTitle));

  const settled = await Promise.allSettled(jobs);
  return settled.map((r) =>
    r.status === "fulfilled" ? r.value : { platform: "unknown", success: false, error: String(r.reason) }
  );
}
