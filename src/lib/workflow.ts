import { prisma } from "@/lib/prisma";
import { fetchGoogleReviews } from "@/lib/google-reviews";
import { analyzeSentiment, generateDraftReply } from "@/lib/openai";
import { sendTelegramAlert } from "@/lib/telegram";

export type WorkflowResult = {
  businessId: string;
  businessName: string;
  fetched: number;
  created: number;
  drafted: number;
  alerts: number;
};

export async function runReviewWorkflow(businessId?: string): Promise<WorkflowResult[]> {
  const businesses = await prisma.business.findMany({
    where: businessId ? { id: businessId } : undefined,
    include: { subscription: true },
  });

  const results: WorkflowResult[] = [];

  for (const business of businesses) {
    const subscriptionOk =
      business.subscription?.status === "active" || business.subscription?.status === "trialing";

    const fetched = await fetchGoogleReviews(business.googlePlaceId);
    let created = 0;
    let drafted = 0;
    let alerts = 0;

    for (const external of fetched) {
      if (!external.text.trim()) continue;

      const existing = await prisma.review.findUnique({
        where: { googleReviewId: external.googleReviewId },
      });
      if (existing) continue;

      const sentiment = await analyzeSentiment(external.text, external.rating);
      const aiResponse = await generateDraftReply({
        businessName: business.name,
        city: business.city,
        reviewText: external.text,
        author: external.author,
        rating: external.rating,
        sentiment,
        language: external.language || business.language,
      });

      await prisma.review.create({
        data: {
          businessId: business.id,
          rating: external.rating,
          text: external.text,
          author: external.author,
          sentiment,
          aiResponse,
          language: external.language || business.language,
          googleReviewId: external.googleReviewId,
          status: "draft_ready",
        },
      });

      created += 1;
      drafted += 1;

      if (subscriptionOk && sentiment === "negative") {
        const sent = await sendTelegramAlert({
          chatId: business.telegramChatId,
          text: `⚠️ Nieuwe negatieve review voor ${business.name} (${external.rating}/5) van ${external.author}:\n${external.text.slice(0, 280)}`,
        });
        if (sent) alerts += 1;
      }
    }

    results.push({
      businessId: business.id,
      businessName: business.name,
      fetched: fetched.length,
      created,
      drafted,
      alerts,
    });
  }

  return results;
}
