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
    return Response.redirect(`${baseUrl}/accounts?error=youtube_denied`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("yt_state")?.value;
  const verifier = cookieStore.get("yt_verifier")?.value;

  if (!state || state !== savedState || !verifier || !code) {
    return Response.redirect(`${baseUrl}/accounts?error=youtube_invalid_state`);
  }

  cookieStore.delete("yt_state");
  cookieStore.delete("yt_verifier");

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${baseUrl}/api/auth/youtube/callback`,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("YouTube token error:", err);
    return Response.redirect(`${baseUrl}/accounts?error=youtube_token_failed`);
  }

  const tokenData = await tokenRes.json();

  // Fetch the user's YouTube channel
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );

  if (!channelRes.ok) {
    return Response.redirect(`${baseUrl}/accounts?error=youtube_channel_failed`);
  }

  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];

  if (!channel) {
    return Response.redirect(`${baseUrl}/accounts?error=youtube_no_channel`);
  }

  await setToken("youtube", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_in
      ? Date.now() + tokenData.expires_in * 1000
      : undefined,
    channelId: channel.id,
    channelTitle: channel.snippet.title,
  });

  return Response.redirect(`${baseUrl}/accounts?success=youtube`);
}
