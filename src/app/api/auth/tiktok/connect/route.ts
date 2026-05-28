import { cookies } from "next/headers";
import { generateState, generateCodeVerifier, generateCodeChallenge } from "@/lib/oauth/pkce";

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    return Response.json({ error: "TIKTOK_CLIENT_KEY not configured" }, { status: 500 });
  }

  const state = generateState();
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set("tt_state", state, { httpOnly: true, maxAge: 600, path: "/", secure, sameSite: "lax" });
  cookieStore.set("tt_verifier", verifier, { httpOnly: true, maxAge: 600, path: "/", secure, sameSite: "lax" });

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: "user.info.basic,video.publish,video.upload",
    response_type: "code",
    redirect_uri: `${baseUrl}/api/auth/tiktok/callback`,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return Response.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params}`);
}
