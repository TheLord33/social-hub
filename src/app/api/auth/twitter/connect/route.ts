import { cookies } from "next/headers";
import { generateState, generateCodeVerifier, generateCodeChallenge } from "@/lib/oauth/pkce";

export async function GET() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  if (!clientId) {
    return Response.json({ error: "TWITTER_CLIENT_ID not configured" }, { status: 500 });
  }

  const state = generateState();
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set("tw_state", state, { httpOnly: true, maxAge: 600, path: "/", secure, sameSite: "lax" });
  cookieStore.set("tw_verifier", verifier, { httpOnly: true, maxAge: 600, path: "/", secure, sameSite: "lax" });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/twitter/callback`,
    scope: "tweet.write tweet.read users.read offline.access",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return Response.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
}
