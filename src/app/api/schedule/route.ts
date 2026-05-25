import { NextRequest } from "next/server";
import { listScheduled, createScheduled } from "@/lib/scheduled-store";
import { MediaType } from "@/lib/compatibility";
import { Platform } from "@/lib/data";

export async function GET() {
  return Response.json(await listScheduled());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.content || !Array.isArray(body.platforms) || !body.scheduledFor) {
    return Response.json({ error: "content, platforms, and scheduledFor are required" }, { status: 400 });
  }

  const scheduledFor = new Date(body.scheduledFor);
  if (isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
    return Response.json({ error: "scheduledFor must be a valid future date" }, { status: 400 });
  }

  const post = await createScheduled({
    content: body.content,
    platforms: body.platforms as Platform[],
    mediaType: (body.mediaType ?? "text") as MediaType,
    mediaUrl: body.mediaUrl,
    redditSubreddit: body.redditSubreddit,
    redditTitle: body.redditTitle,
    scheduledFor: scheduledFor.toISOString(),
  });

  return Response.json(post, { status: 201 });
}
