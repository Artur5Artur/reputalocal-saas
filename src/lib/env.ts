function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  appUrl: optional("APP_URL") ?? "http://localhost:3000",
  cronSecret: optional("CRON_SECRET") ?? "dev-cron-secret",
  sessionSecret: optional("SESSION_SECRET") ?? "dev-session-secret",
  googlePlacesApiKey: optional("GOOGLE_PLACES_API_KEY"),
  openaiApiKey: optional("OPENAI_API_KEY"),
  openaiModel: optional("OPENAI_MODEL") ?? "gpt-4o-mini",
  stripeSecretKey: optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
  stripePriceStarter: optional("STRIPE_PRICE_STARTER"),
  stripePricePro: optional("STRIPE_PRICE_PRO"),
  resendApiKey: optional("RESEND_API_KEY"),
  reportFromEmail: optional("REPORT_FROM_EMAIL") ?? "ReputaLocal <reports@reputalocal.be>",
  telegramBotToken: optional("TELEGRAM_BOT_TOKEN"),
  telegramDefaultChatId: optional("TELEGRAM_DEFAULT_CHAT_ID"),
};
