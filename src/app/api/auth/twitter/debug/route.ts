import { generateState, generateCodeVerifier, generateCodeChallenge } from "@/lib/oauth/pkce";

export async function GET() {
  const clientId = process.env.TWITTER_CLIENT_ID ?? "(not set)";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  const state = generateState();
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/twitter/callback`,
    scope: "tweet.write tweet.read users.read offline.access",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const authorizeUrl = `https://twitter.com/i/oauth2/authorize?${params}`;

  return Response.json({
    clientId,
    baseUrl,
    redirect_uri: `${baseUrl}/api/auth/twitter/callback`,
    authorizeUrl,
  });
}
