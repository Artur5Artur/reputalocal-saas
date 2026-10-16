import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { googleReviewLink } from "@/lib/qr";

export default async function ReviewLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ table?: string }>;
}) {
  const { businessId } = await params;
  const { table } = await searchParams;
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) notFound();

  const href = googleReviewLink(business.googlePlaceId, business.reviewUrl);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-brass-600">{business.city}</p>
      <h1 className="mt-2 font-display text-4xl">{business.name}</h1>
      {table ? <p className="mt-2 text-sm">Tafel {table}</p> : null}
      <p className="mt-4 text-ink-800/80">
        Bedankt voor je bezoek. Een Google-review helpt ons keuken- en zaalteam enorm.
      </p>
      <a
        href={href}
        className="mt-8 rounded-full bg-brass-500 px-6 py-3 text-white"
      >
        Laat een Google-review achter
      </a>
    </main>
  );
}
