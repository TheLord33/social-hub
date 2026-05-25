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
    return Response.redirect(`${baseUrl}/accounts?error=tiktok_denied`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("tt_state")?.value;
  const verifier = cookieStore.get("tt_verifier")?.value;

  if (!state || state !== savedState || !verifier || !code) {
    return Response.redirect(`${baseUrl}/accounts?error=tiktok_invalid_state`);
  }

  cookieStore.delete("tt_state");
  cookieStore.delete("tt_verifier");

  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${baseUrl}/api/auth/tiktok/callback`,
      code_verifier: verifier,
    }),
  });

  if (!tokenRes.ok) {
    console.error("TikTok token error:", await tokenRes.text());
    return Response.redirect(`${baseUrl}/accounts?error=tiktok_token_failed`);
  }

  const tokenData = await tokenRes.json();

  // Fetch display name
  const userRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );

  const userData = userRes.ok ? await userRes.json() : {};
  const displayName = userData.data?.user?.display_name ?? tokenData.open_id;

  await setToken("tiktok", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined,
    openId: tokenData.open_id,
    displayName,
  });

  return Response.redirect(`${baseUrl}/accounts?success=tiktok`);
}
