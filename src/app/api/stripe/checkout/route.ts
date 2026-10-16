import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { PLANS } from "@/lib/plans";
import { getOwnerEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

const bodySchema = z.object({
  businessId: z.string().min(1),
  plan: z.enum(["starter", "pro"]),
});

export async function POST(request: Request) {
  const email = await getOwnerEmail();
  if (!email) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige checkout-aanvraag" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: parsed.data.businessId, ownerEmail: email },
  });
  if (!business) {
    return NextResponse.json({ error: "Zaak niet gevonden" }, { status: 404 });
  }

  if (!env.stripeSecretKey) {
    await prisma.subscription.upsert({
      where: { businessId: business.id },
      create: {
        businessId: business.id,
        status: "active",
        plan: parsed.data.plan,
      },
      update: { status: "active", plan: parsed.data.plan },
    });
    return NextResponse.json({
      url: `${env.appUrl}/dashboard?billing=simulated&plan=${parsed.data.plan}`,
      simulated: true,
      plan: PLANS[parsed.data.plan],
    });
  }

  const session = await createCheckoutSession({
    businessId: business.id,
    plan: parsed.data.plan,
    successUrl: `${env.appUrl}/dashboard?billing=success`,
    cancelUrl: `${env.appUrl}/dashboard?billing=cancelled`,
  });

  return NextResponse.json({ url: session.url, simulated: false });
}
