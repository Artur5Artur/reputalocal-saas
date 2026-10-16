import { NextResponse } from "next/server";
import { getOwnerEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, googleReviewLink, tableReviewLink } from "@/lib/qr";

export async function GET(request: Request) {
  const email = await getOwnerEmail();
  if (!email) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");
  const table = searchParams.get("table") ?? undefined;
  if (!businessId) {
    return NextResponse.json({ error: "businessId is verplicht" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerEmail: email },
  });
  if (!business) {
    return NextResponse.json({ error: "Zaak niet gevonden" }, { status: 404 });
  }

  const landing = tableReviewLink(business.id, table);
  const google = googleReviewLink(business.googlePlaceId, business.reviewUrl);
  const qr = await generateQrDataUrl(landing);

  return NextResponse.json({ qr, landing, google, table: table ?? null, business: business.name });
}
