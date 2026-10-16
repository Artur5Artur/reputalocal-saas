import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getOwnerEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createBillingPortal } from "@/lib/stripe";

const bodySchema = z.object({ businessId: z.string().min(1) });

export async function POST(request: Request) {
  const email = await getOwnerEmail();
  if (!email) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: parsed.data.businessId, ownerEmail: email },
  });
  if (!business) {
    return NextResponse.json({ error: "Zaak niet gevonden" }, { status: 404 });
  }

  if (!env.stripeSecretKey) {
    return NextResponse.json({
      url: `${env.appUrl}/dashboard?billing=portal-simulated`,
      simulated: true,
    });
  }

  const session = await createBillingPortal(business.id, `${env.appUrl}/dashboard`);
  return NextResponse.json({ url: session.url });
}
