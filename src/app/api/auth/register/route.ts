import { NextRequest } from "next/server";
import { createUser } from "@/lib/user-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.name) {
    return Response.json({ error: "name, email, and password are required" }, { status: 400 });
  }

  if (body.password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 422 });
  }

  const result = await createUser(body.email, body.password, body.name);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 409 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
