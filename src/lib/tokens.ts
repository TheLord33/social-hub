import { redisClient } from "./redis";
import fs from "fs";
import path from "path";

const TOKEN_FILE = (userId: string) =>
  path.join(process.cwd(), "data", `tokens-${userId}.json`);
const TOKENS_KEY = (userId: string) => `socialhub:tokens:${userId}`;

export interface TwitterToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  userId: string;
  username: string;
}

export interface FacebookToken {
  pageAccessToken: string;
  pageId: string;
  pageName: string;
}

export interface InstagramToken {
  igUserId: string;
  pageId: string;
  pageAccessToken: string;
  username: string;
}

export interface LinkedInToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  personUrn: string;
  name: string;
}

export interface TikTokToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  openId: string;
  displayName: string;
}

export interface RedditToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  username: string;
}

export interface YouTubeToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  channelId: string;
  channelTitle: string;
}

export interface TokenStore {
  twitter?: TwitterToken;
  facebook?: FacebookToken;
  instagram?: InstagramToken;
  linkedin?: LinkedInToken;
  tiktok?: TikTokToken;
  reddit?: RedditToken;
  youtube?: YouTubeToken;
}

function getRedis() { return redisClient.isAvailable() ? redisClient : null; }

export async function readTokens(userId: string): Promise<TokenStore> {
  const redis = getRedis();
  if (redis) {
    return (await redis.get<TokenStore>(TOKENS_KEY(userId))) ?? {};
  }
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE(userId), "utf-8"));
  } catch {
    return {};
  }
}

export async function writeTokens(userId: string, tokens: TokenStore): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(TOKENS_KEY(userId), tokens);
    return;
  }
  const file = TOKEN_FILE(userId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(tokens, null, 2));
}

export async function setToken<K extends keyof TokenStore>(
  platform: K,
  data: TokenStore[K],
  userId: string
): Promise<void> {
  const tokens = await readTokens(userId);
  tokens[platform] = data;
  await writeTokens(userId, tokens);
}

export async function deleteToken(platform: keyof TokenStore, userId: string): Promise<void> {
  const tokens = await readTokens(userId);
  delete tokens[platform];
  await writeTokens(userId, tokens);
}

export async function getToken<K extends keyof TokenStore>(
  platform: K,
  userId: string
): Promise<TokenStore[K] | undefined> {
  return (await readTokens(userId))[platform];
}

export async function refreshTwitterIfNeeded(userId: string): Promise<string | null> {
  const t = await getToken("twitter", userId);
  if (!t) return null;
  if (!t.expiresAt || Date.now() < t.expiresAt - 60_000) return t.accessToken;
  if (!t.refreshToken) return null;

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: t.refreshToken,
      client_id: process.env.TWITTER_CLIENT_ID!,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  await setToken("twitter", {
    ...t,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? t.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }, userId);
  return data.access_token;
}

export async function refreshLinkedInIfNeeded(userId: string): Promise<string | null> {
  const t = await getToken("linkedin", userId);
  if (!t) return null;
  if (!t.expiresAt || Date.now() < t.expiresAt - 60_000) return t.accessToken;
  if (!t.refreshToken) return null;

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: t.refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  await setToken("linkedin", {
    ...t,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? t.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }, userId);
  return data.access_token;
}

export async function refreshTikTokIfNeeded(userId: string): Promise<string | null> {
  const t = await getToken("tiktok", userId);
  if (!t) return null;
  if (!t.expiresAt || Date.now() < t.expiresAt - 60_000) return t.accessToken;
  if (!t.refreshToken) return null;

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: t.refreshToken,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  await setToken("tiktok", {
    ...t,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? t.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }, userId);
  return data.access_token;
}

export async function refreshYouTubeIfNeeded(userId: string): Promise<string | null> {
  const t = await getToken("youtube", userId);
  if (!t) return null;
  if (!t.expiresAt || Date.now() < t.expiresAt - 60_000) return t.accessToken;
  if (!t.refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: t.refreshToken,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  await setToken("youtube", {
    ...t,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }, userId);
  return data.access_token;
}

export async function refreshRedditIfNeeded(userId: string): Promise<string | null> {
  const t = await getToken("reddit", userId);
  if (!t) return null;
  if (!t.expiresAt || Date.now() < t.expiresAt - 60_000) return t.accessToken;
  if (!t.refreshToken) return null;

  const creds = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "web:socialhub:1.0.0",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: t.refreshToken,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  await setToken("reddit", {
    ...t,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }, userId);
  return data.access_token;
}
