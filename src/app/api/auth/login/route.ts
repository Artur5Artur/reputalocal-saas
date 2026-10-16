import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setOwnerSession } from "@/lib/session";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig e-mailadres" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const count = await prisma.business.count({ where: { ownerEmail: email } });
  if (count === 0) {
    return NextResponse.json(
      { error: "Geen zaak gevonden voor dit e-mailadres. Demo: emma.t@example.net" },
      { status: 404 },
    );
  }

  await setOwnerSession(email);
  return NextResponse.json({ ok: true, businesses: count });
}
