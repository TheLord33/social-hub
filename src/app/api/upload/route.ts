import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"];
  if (!allowed.includes(file.type)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const maxBytes = file.type.startsWith("video/") ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return Response.json({ error: `File too large (max ${file.type.startsWith("video/") ? "500MB" : "10MB"})` }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: "public" });
  return Response.json({ url: blob.url, contentType: file.type });
}
