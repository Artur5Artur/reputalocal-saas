export const PLANS = {
  starter: {
    id: "starter" as const,
    name: "Starter",
    priceMonthly: 49,
    reviewsPerMonth: 150,
    description: "One location, weekly digest, AI drafts in Dutch & English.",
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    priceMonthly: 99,
    reviewsPerMonth: 500,
    description: "Priority sync, Telegram alerts, QR campaigns, monthly report.",
  },
} as const;

export type PlanId = keyof typeof PLANS;
