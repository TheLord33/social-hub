import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

const TOKEN_FILE = path.join(process.cwd(), "data", "tokens.json");
const TOKENS_KEY = "socialhub:tokens";

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

export interface TokenStore {
  twitter?: TwitterToken;
  facebook?: FacebookToken;
  instagram?: InstagramToken;
  linkedin?: LinkedInToken;
  tiktok?: TikTokToken;
  reddit?: RedditToken;
}

let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    _redis = null;
  }
  return _redis;
}

export async function readTokens(): Promise<TokenStore> {
  const redis = getRedis();
  if (redis) {
    return (await redis.get<TokenStore>(TOKENS_KEY)) ?? {};
  }
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export async function writeTokens(tokens: TokenStore): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(TOKENS_KEY, tokens);
    return;
  }
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

export async function setToken<K extends keyof TokenStore>(
  platform: K,
  data: TokenStore[K]
): Promise<void> {
  const tokens = await readTokens();
  tokens[platform] = data;
  await writeTokens(tokens);
}

export async function deleteToken(platform: keyof TokenStore): Promise<void> {
  const tokens = await readTokens();
  delete tokens[platform];
  await writeTokens(tokens);
}

export async function getToken<K extends keyof TokenStore>(
  platform: K
): Promise<TokenStore[K] | undefined> {
  return (await readTokens())[platform];
}

export async function refreshTwitterIfNeeded(): Promise<string | null> {
  const t = await getToken("twitter");
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
  });
  return data.access_token;
}

export async function refreshTikTokIfNeeded(): Promise<string | null> {
  const t = await getToken("tiktok");
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
  });
  return data.access_token;
}

export async function refreshRedditIfNeeded(): Promise<string | null> {
  const t = await getToken("reddit");
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
  });
  return data.access_token;
}
