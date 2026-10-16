import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { sendTelegramAlert } from "@/lib/telegram";
import { getOwnerEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  businessId: z.string().optional(),
  text: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige Telegram-aanvraag" }, { status: 400 });
  }

  const cronOk = request.headers.get("authorization") === `Bearer ${env.cronSecret}`;
  const email = await getOwnerEmail();
  if (!email && !cronOk) {
    return NextResponse.json({ error: "Niet gemachtigd" }, { status: 401 });
  }

  let chatId: string | null = env.telegramDefaultChatId ?? null;
  if (parsed.data.businessId) {
    const business = await prisma.business.findFirst({
      where: {
        id: parsed.data.businessId,
        ...(email ? { ownerEmail: email } : {}),
      },
    });
    if (!business) {
      return NextResponse.json({ error: "Zaak niet gevonden" }, { status: 404 });
    }
    chatId = business.telegramChatId;
  }

  const delivered = await sendTelegramAlert({ chatId, text: parsed.data.text });
  return NextResponse.json({ delivered, simulated: !delivered });
}
