import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { setToken } from "@/lib/tokens";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  if (!userId) return Response.redirect(`${baseUrl}/login`);

  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return Response.redirect(`${baseUrl}/accounts?error=reddit_denied`);

  const cookieStore = await cookies();
  const savedState = cookieStore.get("reddit_state")?.value;

  if (!state || state !== savedState || !code) {
    return Response.redirect(`${baseUrl}/accounts?error=reddit_invalid_state`);
  }

  cookieStore.delete("reddit_state");

  const creds = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString("base64");

  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "web:socialhub:1.0.0" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: `${baseUrl}/api/auth/reddit/callback` }),
  });

  if (!tokenRes.ok) return Response.redirect(`${baseUrl}/accounts?error=reddit_token_failed`);
  const tokenData = await tokenRes.json();

  const userRes = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "web:socialhub:1.0.0" },
  });

  if (!userRes.ok) return Response.redirect(`${baseUrl}/accounts?error=reddit_user_failed`);
  const user = await userRes.json();

  await setToken("reddit", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined,
    username: user.name,
  }, userId);

  return Response.redirect(`${baseUrl}/accounts?success=reddit`);
}
