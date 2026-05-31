import { type NextRequest } from "next/server";
import Stripe from "stripe";
import { updateUser } from "@/lib/user-store";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const base = process.env.NEXT_PUBLIC_BASE_URL!;

  if (!sessionId) {
    return Response.redirect(`${base}/settings`);
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid" || session.status === "complete") {
      const email = session.metadata?.userEmail;
      const customerId = session.customer as string;
      if (email) {
        await updateUser(email, { plan: "pro", stripeCustomerId: customerId });
      }
    }
  } catch {
    // If verification fails, still redirect — don't block the user
  }

  return Response.redirect(`${base}/settings?upgraded=1`);
}
