import Stripe from "stripe";
import { env } from "@/lib/env";
import { PLANS, type PlanId } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export function getStripe() {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(env.stripeSecretKey);
}

export function priceIdForPlan(plan: PlanId) {
  const priceId = plan === "pro" ? env.stripePricePro : env.stripePriceStarter;
  if (!priceId) {
    throw new Error(`Stripe price for ${plan} is not configured`);
  }
  return priceId;
}

export async function createCheckoutSession(input: {
  businessId: string;
  plan: PlanId;
  successUrl: string;
  cancelUrl: string;
}) {
  const business = await prisma.business.findUniqueOrThrow({
    where: { id: input.businessId },
    include: { subscription: true },
  });

  const stripe = getStripe();
  let customerId = business.subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: business.ownerEmail,
      name: business.name,
      metadata: { businessId: business.id },
    });
    customerId = customer.id;
    await prisma.subscription.upsert({
      where: { businessId: business.id },
      create: {
        businessId: business.id,
        stripeCustomerId: customerId,
        plan: input.plan,
        status: "incomplete",
      },
      update: { stripeCustomerId: customerId, plan: input.plan },
    });
  }

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdForPlan(input.plan), quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: { businessId: business.id, plan: input.plan },
    subscription_data: {
      metadata: { businessId: business.id, plan: input.plan },
    },
  });
}

export async function createBillingPortal(businessId: string, returnUrl: string) {
  const subscription = await prisma.subscription.findUniqueOrThrow({
    where: { businessId },
  });
  if (!subscription.stripeCustomerId) {
    throw new Error("No Stripe customer on file");
  }
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  });
}

export async function syncStripeSubscription(stripeSubscription: Stripe.Subscription) {
  const businessId = stripeSubscription.metadata.businessId;
  if (!businessId) return;

  const plan = stripeSubscription.metadata.plan === "pro" ? "pro" : "starter";
  const status = mapStatus(stripeSubscription.status);
  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;
  const periodEndUnix =
    stripeSubscription.items.data[0]?.current_period_end ??
    (stripeSubscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;

  await prisma.subscription.upsert({
    where: { businessId },
    create: {
      businessId,
      status,
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
    },
    update: {
      status,
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
    },
  });
}

function mapStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
      return status;
    default:
      return "incomplete" as const;
  }
}

export { PLANS };
