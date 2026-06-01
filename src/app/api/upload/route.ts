import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"];
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp",
  "video/mp4": ".mp4", "video/quicktime": ".mov", "video/webm": ".webm",
};

async function uploadToVercelBlob(file: File) {
  const { put } = await import("@vercel/blob");
  const blob = await put(file.name, file, { access: "public" });
  return blob.url;
}

async function saveLocally(file: File): Promise<string> {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}${EXT[file.type] ?? ""}`;
  const dest = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  return `${base}/api/uploads/${filename}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  if (!ALLOWED.includes(file.type)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const maxBytes = file.type.startsWith("video/") ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return Response.json({ error: `File too large (max ${file.type.startsWith("video/") ? "500MB" : "10MB"})` }, { status: 400 });
  }

  const url = process.env.BLOB_READ_WRITE_TOKEN
    ? await uploadToVercelBlob(file)
    : await saveLocally(file);

  return Response.json({ url, contentType: file.type });
}
