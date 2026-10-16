import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnerEmail } from "@/lib/session";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const email = await getOwnerEmail();
  if (!email) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await context.params;
  const review = await prisma.review.findFirst({
    where: { id, business: { ownerEmail: email } },
  });

  if (!review) {
    return NextResponse.json({ error: "Review niet gevonden" }, { status: 404 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { status: "approved", publishedAt: new Date() },
  });

  return NextResponse.json({ review: updated });
}
