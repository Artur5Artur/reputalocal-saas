import { NextResponse } from "next/server";
import { z } from "zod";
import { getOwnerEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { runReviewWorkflow } from "@/lib/workflow";

const bodySchema = z.object({
  businessId: z.string().min(1),
});

export async function POST(request: Request) {
  const email = await getOwnerEmail();
  if (!email) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "businessId is verplicht" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: parsed.data.businessId, ownerEmail: email },
  });
  if (!business) {
    return NextResponse.json({ error: "Zaak niet gevonden" }, { status: 404 });
  }

  const results = await runReviewWorkflow(business.id);
  return NextResponse.json({ ok: true, results });
}
