import { redirect } from "next/navigation";
import { getSessionBusinesses } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const { email, businesses } = await getSessionBusinesses();
  if (!email || businesses.length === 0) {
    redirect("/login");
  }

  const params = await searchParams;
  const selectedBusinessId =
    businesses.find((item) => item.id === params.business)?.id ?? businesses[0].id;

  const reviews = await prisma.review.findMany({
    where: { businessId: selectedBusinessId },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return (
    <main className="min-h-screen">
      <DashboardClient
        email={email}
        businesses={businesses}
        reviews={reviews}
        selectedBusinessId={selectedBusinessId}
      />
    </main>
  );
}
