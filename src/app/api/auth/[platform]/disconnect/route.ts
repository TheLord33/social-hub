import { NextRequest } from "next/server";
import { deleteToken, getToken, TokenStore } from "@/lib/tokens";
import { auth } from "@/auth";

const VALID_PLATFORMS: Array<keyof TokenStore> = [
  "twitter", "facebook", "instagram", "linkedin", "tiktok", "reddit", "youtube",
];

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { platform } = await params;

  if (!VALID_PLATFORMS.includes(platform as keyof TokenStore)) {
    return Response.json({ error: "Invalid platform" }, { status: 400 });
  }

  const key = platform as keyof TokenStore;

  if (key === "twitter") {
    const t = await getToken("twitter", userId);
    if (t?.accessToken && process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
      const creds = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64");
      await fetch("https://api.twitter.com/2/oauth2/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${creds}` },
        body: new URLSearchParams({ token: t.accessToken, token_type_hint: "access_token" }),
      }).catch(() => {});
    }
  }

  if (key === "tiktok") {
    const t = await getToken("tiktok", userId);
    if (t?.accessToken && process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
      await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_key: process.env.TIKTOK_CLIENT_KEY, client_secret: process.env.TIKTOK_CLIENT_SECRET, token: t.accessToken }),
      }).catch(() => {});
    }
  }

  if (key === "facebook") await deleteToken("instagram", userId);
  if (key === "instagram") await deleteToken("facebook", userId);

  await deleteToken(key, userId);
  return Response.json({ ok: true });
}
