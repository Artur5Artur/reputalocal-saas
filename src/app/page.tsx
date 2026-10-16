import Link from "next/link";
import { PLANS } from "@/lib/plans";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl">ReputaLocal</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-ink-800 hover:underline">
            Inloggen
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-ink-900 px-4 py-2 text-white hover:bg-ink-800"
          >
            Start demo
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <p className="text-sm uppercase tracking-[0.2em] text-brass-600">Vlaanderen · HoReCa</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight md:text-6xl">
          Jouw Google-reviews, beantwoord voordat de koffie koud is.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-800/80">
          ReputaLocal haalt reviews op, analyseert sentiment met AI en schrijft professionele
          conceptantwoorden in het Nederlands en Engels. Jij keurt goed met één klik.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-brass-500 px-6 py-3 text-white">
            Open dashboard
          </Link>
          <a href="#pricing" className="rounded-full border border-ink-800 px-6 py-3">
            Prijzen
          </a>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            ["Google sync", "Periodieke import van Maps-reviews per zaak."],
            ["AI-antwoorden", "Sentiment + draft replies, klaar om te publiceren."],
            ["Tafel-QR", "Genereer QR-codes die gasten naar je reviewpagina leiden."],
          ].map(([title, body]) => (
            <article key={title} className="card p-6">
              <h2 className="font-display text-2xl">{title}</h2>
              <p className="mt-2 text-sm text-ink-800/75">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-ink-100 bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          {Object.values(PLANS).map((plan) => (
            <article key={plan.id} className="card p-8">
              <p className="text-sm uppercase tracking-widest text-brass-600">{plan.name}</p>
              <p className="mt-3 font-display text-5xl">€{plan.priceMonthly}<span className="text-xl">/mo</span></p>
              <p className="mt-3 text-ink-800/75">{plan.description}</p>
              <p className="mt-2 text-sm">{plan.reviewsPerMonth} reviews / maand</p>
              <Link href="/login" className="mt-6 inline-block rounded-full bg-ink-900 px-5 py-2 text-white">
                Kies {plan.name}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
