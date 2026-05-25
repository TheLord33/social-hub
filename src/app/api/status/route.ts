import { readTokens } from "@/lib/tokens";

export async function GET() {
  const tokens = await readTokens();

  return Response.json({
    twitter: tokens.twitter
      ? { connected: true, username: `@${tokens.twitter.username}` }
      : { connected: false },
    facebook: tokens.facebook
      ? { connected: true, username: tokens.facebook.pageName }
      : { connected: false },
    instagram: tokens.instagram
      ? { connected: true, username: `@${tokens.instagram.username}` }
      : { connected: false },
    linkedin: tokens.linkedin
      ? { connected: true, username: tokens.linkedin.name }
      : { connected: false },
    tiktok: tokens.tiktok
      ? { connected: true, username: `@${tokens.tiktok.displayName}` }
      : { connected: false },
    reddit: tokens.reddit
      ? { connected: true, username: `u/${tokens.reddit.username}` }
      : { connected: false },
  });
}
