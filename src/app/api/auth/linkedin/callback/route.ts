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
    return Response.redirect(`${baseUrl}/accounts?error=linkedin_denied`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("li_state")?.value;

  if (!state || state !== savedState || !code) {
    return Response.redirect(`${baseUrl}/accounts?error=linkedin_invalid_state`);
  }

  cookieStore.delete("li_state");

  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${baseUrl}/api/auth/linkedin/callback`,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("LinkedIn token error:", err);
    return Response.redirect(`${baseUrl}/accounts?error=linkedin_token_failed`);
  }

  const tokenData = await tokenRes.json();

  // Get user profile using OpenID Connect userinfo endpoint
  const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    return Response.redirect(`${baseUrl}/accounts?error=linkedin_user_failed`);
  }

  const user = await userRes.json();
  const personUrn = `urn:li:person:${user.sub}`;

  setToken("linkedin", {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_in
      ? Date.now() + tokenData.expires_in * 1000
      : undefined,
    personUrn,
    name: user.name ?? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim(),
  });

  return Response.redirect(`${baseUrl}/accounts?success=linkedin`);
}
