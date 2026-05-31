import { auth } from "@/auth";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
    customer_email: session.user.email,
    metadata: { userId: session.user.id, userEmail: session.user.email },
  });

  return Response.json({ url: checkoutSession.url });
}
