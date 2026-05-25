import { cookies } from "next/headers";
import { generateState } from "@/lib/oauth/pkce";

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return Response.json({ error: "LINKEDIN_CLIENT_ID not configured" }, { status: 500 });
  }

  const state = generateState();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  const cookieStore = await cookies();
  cookieStore.set("li_state", state, { httpOnly: true, maxAge: 600, path: "/" });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/linkedin/callback`,
    state,
    scope: "openid profile w_member_social",
  });

  return Response.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
}
