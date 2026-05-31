import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/user-store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserByEmail(session.user.email);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    hasStripe: !!user.stripeCustomerId,
  });
}
