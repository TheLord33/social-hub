import { NextRequest } from "next/server";
import { cancelScheduled, getScheduled } from "@/lib/scheduled-store";
import { auth } from "@/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getScheduled(id);
  if (!post || post.userId !== session.user.id) {
    return Response.json({ error: "Not found or already published" }, { status: 404 });
  }
  const ok = await cancelScheduled(id);
  if (!ok) return Response.json({ error: "Not found or already published" }, { status: 404 });
  return Response.json({ ok: true });
}
