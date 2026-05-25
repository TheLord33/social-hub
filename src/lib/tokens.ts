import fs from "fs";
import path from "path";

const TOKEN_FILE = path.join(process.cwd(), "data", "tokens.json");

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

export function readTokens(): TokenStore {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeTokens(tokens: TokenStore): void {
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

export function setToken<K extends keyof TokenStore>(
  platform: K,
  data: TokenStore[K]
): void {
  const tokens = readTokens();
  tokens[platform] = data;
  writeTokens(tokens);
}

export function deleteToken(platform: keyof TokenStore): void {
  const tokens = readTokens();
  delete tokens[platform];
  writeTokens(tokens);
}

export function getToken<K extends keyof TokenStore>(
  platform: K
): TokenStore[K] | undefined {
  return readTokens()[platform];
}

export async function refreshTwitterIfNeeded(): Promise<string | null> {
  const t = getToken("twitter");
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
  setToken("twitter", {
    ...t,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? t.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}

export async function refreshTikTokIfNeeded(): Promise<string | null> {
  const t = getToken("tiktok");
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
  setToken("tiktok", {
    ...t,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? t.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}

export async function refreshRedditIfNeeded(): Promise<string | null> {
  const t = getToken("reddit");
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
  setToken("reddit", {
    ...t,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}
