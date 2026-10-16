-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('positive', 'neutral', 'negative');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('new', 'draft_ready', 'approved', 'published', 'skipped');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('starter', 'pro');

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "google_place_id" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'nl',
    "telegram_chat_id" TEXT,
    "review_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "sentiment" "Sentiment",
    "ai_response" TEXT,
    "language" TEXT NOT NULL DEFAULT 'nl',
    "google_review_id" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'new',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'incomplete',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "plan" "PlanTier" NOT NULL DEFAULT 'starter',
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_google_place_id_key" ON "businesses"("google_place_id");

-- CreateIndex
CREATE INDEX "businesses_owner_email_idx" ON "businesses"("owner_email");

-- CreateIndex
CREATE INDEX "businesses_city_idx" ON "businesses"("city");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_google_review_id_key" ON "reviews"("google_review_id");

-- CreateIndex
CREATE INDEX "reviews_business_id_created_at_idx" ON "reviews"("business_id", "created_at");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_business_id_key" ON "subscriptions"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
