import { NextRequest } from "next/server";
import { publishAll } from "@/lib/post-engine";
import { MediaType } from "@/lib/compatibility";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.content || !Array.isArray(body.platforms)) {
    return Response.json({ error: "content and platforms are required" }, { status: 400 });
  }

  const results = await publishAll({
    content: body.content,
    platforms: body.platforms,
    mediaType: body.mediaType as MediaType | undefined,
    mediaUrl: body.mediaUrl,
    redditSubreddit: body.redditSubreddit,
    redditTitle: body.redditTitle,
    youtubeTitle: body.youtubeTitle,
    youtubePrivacy: body.youtubePrivacy,
  });

  return Response.json({ results }, { status: results.some((r) => r.success) ? 200 : 422 });
}
