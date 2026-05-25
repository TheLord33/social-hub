import { NextRequest } from "next/server";
import { deleteToken, getToken, TokenStore } from "@/lib/tokens";

const VALID_PLATFORMS: Array<keyof TokenStore> = [
  "twitter", "facebook", "instagram", "linkedin", "tiktok", "reddit",
];

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;

  if (!VALID_PLATFORMS.includes(platform as keyof TokenStore)) {
    return Response.json({ error: "Invalid platform" }, { status: 400 });
  }

  const key = platform as keyof TokenStore;

  // Twitter — revoke token via API
  if (key === "twitter") {
    const t = getToken("twitter");
    if (t?.accessToken && process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
      const creds = Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString("base64");
      await fetch("https://api.twitter.com/2/oauth2/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${creds}`,
        },
        body: new URLSearchParams({ token: t.accessToken, token_type_hint: "access_token" }),
      }).catch(() => {});
    }
  }

  // TikTok — revoke token via API
  if (key === "tiktok") {
    const t = getToken("tiktok");
    if (t?.accessToken && process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
      await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          token: t.accessToken,
        }),
      }).catch(() => {});
    }
  }

  // Meta — facebook and instagram share one OAuth session
  if (key === "facebook") deleteToken("instagram");
  if (key === "instagram") deleteToken("facebook");

  deleteToken(key);
  return Response.json({ ok: true });
}
