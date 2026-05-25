import { cookies } from "next/headers";
import { generateState } from "@/lib/oauth/pkce";

export async function GET() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  if (!clientId) {
    return Response.json({ error: "REDDIT_CLIENT_ID not configured" }, { status: 500 });
  }

  const state = generateState();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  const cookieStore = await cookies();
  cookieStore.set("reddit_state", state, { httpOnly: true, maxAge: 600, path: "/" });

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    state,
    redirect_uri: `${baseUrl}/api/auth/reddit/callback`,
    duration: "permanent",
    scope: "submit identity",
  });

  return Response.redirect(`https://www.reddit.com/api/v1/authorize?${params}`);
}
