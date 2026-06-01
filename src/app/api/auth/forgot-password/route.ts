import { NextRequest } from "next/server";
import { getUserByEmail } from "@/lib/user-store";
import { createResetToken } from "@/lib/reset-store";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return Response.json({ error: "Email required" }, { status: 400 });
  }

  // Always return success to avoid revealing whether an account exists
  const user = await getUserByEmail(email);
  if (user) {
    const token = await createResetToken(email);
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    await sendPasswordResetEmail(email, `${base}/reset-password?token=${token}`);
  }

  return Response.json({ ok: true });
}
