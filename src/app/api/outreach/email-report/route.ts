import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { sendWeeklyEmailReport } from "@/lib/email";
import { getOwnerEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  businessId: z.string().min(1),
});

function cronAuthorized(request: Request) {
  const header = request.headers.get("authorization");
  return header === `Bearer ${env.cronSecret}`;
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "businessId is verplicht" }, { status: 400 });
  }

  const email = await getOwnerEmail();
  const allowed = cronAuthorized(request);

  if (!email && !allowed) {
    return NextResponse.json({ error: "Niet gemachtigd" }, { status: 401 });
  }

  if (email) {
    const owned = await prisma.business.findFirst({
      where: { id: parsed.data.businessId, ownerEmail: email },
    });
    if (!owned) {
      return NextResponse.json({ error: "Zaak niet gevonden" }, { status: 404 });
    }
  }

  const result = await sendWeeklyEmailReport(parsed.data.businessId);
  return NextResponse.json(result);
}
