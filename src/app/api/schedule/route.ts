import { NextRequest } from "next/server";
import { listScheduled, createScheduled } from "@/lib/scheduled-store";
import { MediaType } from "@/lib/compatibility";
import { Platform } from "@/lib/data";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await listScheduled(session.user.id));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);

  if (!body?.content || !Array.isArray(body.platforms) || !body.scheduledFor) {
    return Response.json({ error: "content, platforms, and scheduledFor are required" }, { status: 400 });
  }

  const scheduledFor = new Date(body.scheduledFor);
  if (isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
    return Response.json({ error: "scheduledFor must be a valid future date" }, { status: 400 });
  }

  const post = await createScheduled({
    userId: session.user.id,
    content: body.content,
    platforms: body.platforms as Platform[],
    mediaType: (body.mediaType ?? "text") as MediaType,
    mediaUrl: body.mediaUrl,
    redditSubreddit: body.redditSubreddit,
    redditTitle: body.redditTitle,
    youtubeTitle: body.youtubeTitle,
    youtubePrivacy: body.youtubePrivacy,
    scheduledFor: scheduledFor.toISOString(),
  });

  return Response.json(post, { status: 201 });
}
