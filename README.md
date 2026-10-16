# ReputaLocal

SaaS for automated reputation and review management for cafés and restaurants in Flanders.

## Stack

- Next.js 15 App Router + TypeScript + Tailwind CSS
- Prisma (PostgreSQL / Supabase)
- OpenAI sentiment + Dutch/English reply drafts
- Stripe Checkout + Customer Portal
- Resend e-mail reports and Telegram alerts
- Vercel Cron every 6 hours (`/api/cron/sync-reviews`)

## Setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Demo login: `emma.t@example.net`

Without `GOOGLE_PLACES_API_KEY` / `OPENAI_API_KEY` / `STRIPE_SECRET_KEY` the app uses mock reviews, heuristic drafts, and a simulated checkout so you can demo the dashboard locally.

## Key routes

| Path | Purpose |
| --- | --- |
| `/dashboard` | Ratings, reviews, one-click AI approve, QR, billing |
| `/api/cron/sync-reviews` | Fetch Google reviews → sentiment → AI draft |
| `/api/stripe/checkout` | Monthly Starter €49 / Pro €99 |
| `/api/stripe/webhook` | Subscription sync |
| `/api/outreach/email-report` | Weekly owner report |
| `/api/outreach/telegram` | Negative-review / manual alerts |

Protect cron with `Authorization: Bearer $CRON_SECRET`.
