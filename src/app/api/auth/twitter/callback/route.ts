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
    return Response.redirect(`${baseUrl}/accounts?error=twitter_denied`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("tw_state")?.value;
  const verifier = cookieStore.get("tw_verifier")?.value;

  if (!state || state !== savedState || !verifier || !code) {
    return Response.redirect(`${baseUrl}/accounts?error=twitter_invalid_state`);
  }

  cookieStore.delete("tw_state");
  cookieStore.delete("tw_verifier");

  const clientId = process.env.TWITTER_CLIENT_ID!;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${baseUrl}/api/auth/twitter/callback`,
      code_verifier: verifier,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("Twitter token error:", err);
    return Response.redirect(`${baseUrl}/accounts?error=twitter_token_failed`);
  }

  const tokenData = await tokenRes.json();

  const userRes = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    return Response.redirect(`${baseUrl}/accounts?error=twitter_user_failed`);
  }

  const userData = await userRes.json();

  await setToken("twitter", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_in
      ? Date.now() + tokenData.expires_in * 1000
      : undefined,
    userId: userData.data.id,
    username: userData.data.username,
  });

  return Response.redirect(`${baseUrl}/accounts?success=twitter`);
}
