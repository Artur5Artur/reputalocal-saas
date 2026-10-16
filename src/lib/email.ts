import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export async function sendWeeklyEmailReport(businessId: string) {
  const business = await prisma.business.findUniqueOrThrow({
    where: { id: businessId },
    include: {
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  const ratings = business.reviews.map((r) => r.rating);
  const average =
    ratings.length === 0 ? 0 : ratings.reduce((sum, n) => sum + n, 0) / ratings.length;
  const pending = business.reviews.filter((r) => r.status === "draft_ready").length;
  const negatives = business.reviews.filter((r) => r.sentiment === "negative").length;

  const subject = `ReputaLocal weekrapport — ${business.name}`;
  const html = `
    <h1 style="font-family:Georgia,serif">${business.name}</h1>
    <p>Gemiddelde score: <strong>${average.toFixed(2)}</strong> · ${business.reviews.length} recente reviews</p>
    <p>AI-antwoorden klaar voor goedkeuring: <strong>${pending}</strong></p>
    <p>Negatieve reviews deze periode: <strong>${negatives}</strong></p>
    <p><a href="${env.appUrl}/dashboard">Open dashboard</a></p>
  `;

  if (!env.resendApiKey) {
    return {
      delivered: false,
      simulated: true,
      to: business.ownerEmail,
      subject,
      preview: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.reportFromEmail,
      to: [business.ownerEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend failed: ${await response.text()}`);
  }

  return { delivered: true, simulated: false, to: business.ownerEmail, subject };
}
