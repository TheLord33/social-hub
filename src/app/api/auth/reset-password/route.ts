import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { consumeResetToken } from "@/lib/reset-store";
import { updateUser } from "@/lib/user-store";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));

  if (!token || !password || typeof token !== "string" || typeof password !== "string") {
    return Response.json({ error: "Token and password required" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const email = await consumeResetToken(token);
  if (!email) {
    return Response.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await updateUser(email, { passwordHash });

  return Response.json({ ok: true });
}
