import { auth } from "@/auth";
import { getUserByEmail } from "@/lib/user-store";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByEmail(session.user.email);
  if (!user?.stripeCustomerId) {
    return Response.json({ error: "No billing account found" }, { status: 400 });
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
  });

  return Response.json({ url: portalSession.url });
}
