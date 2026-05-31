import Stripe from "stripe";
import { updateUser, getUserByStripeCustomerId } from "@/lib/user-store";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return Response.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.userEmail;
      if (email && session.customer) {
        await updateUser(email, {
          plan: "pro",
          stripeCustomerId: session.customer as string,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const user = await getUserByStripeCustomerId(sub.customer as string);
      if (user) await updateUser(user.email, { plan: "free" });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const user = await getUserByStripeCustomerId(invoice.customer as string);
      if (user) await updateUser(user.email, { plan: "free" });
      break;
    }
  }

  return Response.json({ received: true });
}
