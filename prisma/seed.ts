import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = "emma.t@example.net";

  const cafe = await prisma.business.upsert({
    where: { googlePlaceId: "ChIJghent-demo-place" },
    update: {},
    create: {
      name: "Café De Korenlei",
      city: "Gent",
      googlePlaceId: "ChIJghent-demo-place",
      ownerEmail,
      language: "nl",
      telegramChatId: process.env.TELEGRAM_DEFAULT_CHAT_ID,
      reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJghent-demo-place",
    },
  });

  const restaurant = await prisma.business.upsert({
    where: { googlePlaceId: "ChIJantwerp-demo-place" },
    update: {},
    create: {
      name: "Bistro Het Zuid",
      city: "Antwerpen",
      googlePlaceId: "ChIJantwerp-demo-place",
      ownerEmail,
      language: "nl",
    },
  });

  await prisma.subscription.upsert({
    where: { businessId: cafe.id },
    update: { status: "trialing", plan: "pro" },
    create: {
      businessId: cafe.id,
      status: "trialing",
      plan: "pro",
    },
  });

  await prisma.subscription.upsert({
    where: { businessId: restaurant.id },
    update: { status: "incomplete", plan: "starter" },
    create: {
      businessId: restaurant.id,
      status: "incomplete",
      plan: "starter",
    },
  });

  await prisma.review.deleteMany({
    where: { businessId: { in: [cafe.id, restaurant.id] }, googleReviewId: { startsWith: "seed-" } },
  });

  await prisma.review.createMany({
    data: [
      {
        businessId: cafe.id,
        rating: 5,
        text: "Beste koffie van de Graslei en een zalige appeltaart. Bediening kende onze namen na twee bezoeken.",
        author: "Annelies P.",
        sentiment: "positive",
        language: "nl",
        googleReviewId: "seed-cafe-1",
        status: "draft_ready",
        aiResponse:
          "Beste Annelies, wat een plezier om te lezen! Namens het team van Café De Korenlei: tot snel opnieuw aan de Graslei — de appeltaart staat klaar.",
      },
      {
        businessId: cafe.id,
        rating: 2,
        text: "We wachtten lang op de rekening en de cappuccino was koud. Spijtig.",
        author: "Koen M.",
        sentiment: "negative",
        language: "nl",
        googleReviewId: "seed-cafe-2",
        status: "draft_ready",
        aiResponse:
          "Beste Koen, het spijt ons dat de afronding van je bezoek tegenviel. We spreken de zaal hier intern op aan en hopen je een volgende keer een warme cappuccino én een vlotte rekening te bieden.",
      },
      {
        businessId: restaurant.id,
        rating: 4,
        text: "Great steak tartare near the Zuid. A little noisy at peak hour but the wine list is excellent.",
        author: "Sofia L.",
        sentiment: "positive",
        language: "en",
        googleReviewId: "seed-bistro-1",
        status: "draft_ready",
        aiResponse:
          "Dear Sofia, thank you — the team at Bistro Het Zuid is glad the tartare and wine list hit the mark. We’ll keep an eye on the noise at peak hour and hope to welcome you back soon.",
      },
    ],
  });

  console.log("Seeded ReputaLocal demo businesses for", ownerEmail);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
