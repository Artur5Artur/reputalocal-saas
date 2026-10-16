import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe, syncStripeSubscription } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!env.stripeSecretKey || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await syncStripeSubscription(event.data.object as Stripe.Subscription);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.subscription && typeof session.subscription === "string") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await syncStripeSubscription(subscription);
    }
  }

  return NextResponse.json({ received: true });
}
