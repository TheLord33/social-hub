import { cookies } from "next/headers";
import { generateState } from "@/lib/oauth/pkce";

export async function GET() {
  const appId = process.env.META_APP_ID;
  if (!appId) {
    return Response.json({ error: "META_APP_ID not configured" }, { status: 500 });
  }

  const state = generateState();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set("meta_state", state, { httpOnly: true, maxAge: 600, path: "/", secure, sameSite: "lax" });

  const scopes = [
    "pages_show_list",
    "pages_manage_posts",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
  ].join(",");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${baseUrl}/api/auth/meta/callback`,
    state,
    scope: scopes,
    response_type: "code",
  });

  return Response.redirect(`https://www.facebook.com/v18.0/dialog/oauth?${params}`);
}
