import { NextRequest } from "next/server";
import { cancelScheduled } from "@/lib/scheduled-store";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await cancelScheduled(id);
  if (!ok) return Response.json({ error: "Not found or already published" }, { status: 404 });
  return Response.json({ ok: true });
}
