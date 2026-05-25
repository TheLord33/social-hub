import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { setToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  if (error) {
    return Response.redirect(`${baseUrl}/accounts?error=reddit_denied`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("reddit_state")?.value;

  if (!state || state !== savedState || !code) {
    return Response.redirect(`${baseUrl}/accounts?error=reddit_invalid_state`);
  }

  cookieStore.delete("reddit_state");

  const clientId = process.env.REDDIT_CLIENT_ID!;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET!;
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "web:socialhub:1.0.0",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${baseUrl}/api/auth/reddit/callback`,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Reddit token error:", await tokenRes.text());
    return Response.redirect(`${baseUrl}/accounts?error=reddit_token_failed`);
  }

  const tokenData = await tokenRes.json();

  const userRes = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "web:socialhub:1.0.0",
    },
  });

  if (!userRes.ok) {
    return Response.redirect(`${baseUrl}/accounts?error=reddit_user_failed`);
  }

  const user = await userRes.json();

  await setToken("reddit", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined,
    username: user.name,
  });

  return Response.redirect(`${baseUrl}/accounts?success=reddit`);
}
