import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { setToken } from "@/lib/tokens";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3030";

  if (!userId) return Response.redirect(`${baseUrl}/login`);

  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return Response.redirect(`${baseUrl}/accounts?error=meta_denied`);

  const cookieStore = await cookies();
  const savedState = cookieStore.get("meta_state")?.value;

  if (!state || state !== savedState || !code) {
    return Response.redirect(`${baseUrl}/accounts?error=meta_invalid_state`);
  }

  cookieStore.delete("meta_state");

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;

  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: `${baseUrl}/api/auth/meta/callback`, code })
  );

  if (!tokenRes.ok) return Response.redirect(`${baseUrl}/accounts?error=meta_token_failed`);
  const { access_token: shortToken } = await tokenRes.json();

  const longRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({ grant_type: "fb_exchange_token", client_id: appId, client_secret: appSecret, fb_exchange_token: shortToken })
  );
  const { access_token: longToken } = longRes.ok ? await longRes.json() : { access_token: shortToken };

  const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${longToken}`);
  if (!pagesRes.ok) return Response.redirect(`${baseUrl}/accounts?error=meta_pages_failed`);

  const pagesData = await pagesRes.json();
  const pages: Array<{ id: string; name: string; access_token: string }> = pagesData.data ?? [];
  if (pages.length === 0) return Response.redirect(`${baseUrl}/accounts?error=meta_no_pages`);

  const page = pages[0];

  await setToken("facebook", { pageAccessToken: page.access_token, pageId: page.id, pageName: page.name }, userId);

  const igRes = await fetch(
    `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
  );

  if (igRes.ok) {
    const igData = await igRes.json();
    if (igData.instagram_business_account?.id) {
      const igId = igData.instagram_business_account.id;
      const igUserRes = await fetch(`https://graph.facebook.com/v18.0/${igId}?fields=username&access_token=${page.access_token}`);
      const igUser = igUserRes.ok ? await igUserRes.json() : {};
      await setToken("instagram", { igUserId: igId, pageId: page.id, pageAccessToken: page.access_token, username: igUser.username ?? igId }, userId);
    }
  }

  return Response.redirect(`${baseUrl}/accounts?success=meta`);
}
