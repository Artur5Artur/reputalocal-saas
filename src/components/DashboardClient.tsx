"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Business, Review, Subscription } from "@prisma/client";
import { PLANS } from "@/lib/plans";

type BusinessWithSub = Business & { subscription: Subscription | null };

type Props = {
  email: string;
  businesses: BusinessWithSub[];
  reviews: Review[];
  selectedBusinessId: string;
};

export function DashboardClient({ email, businesses, reviews, selectedBusinessId }: Props) {
  const router = useRouter();
  const business = businesses.find((item) => item.id === selectedBusinessId) ?? businesses[0];
  const [table, setTable] = useState("12");
  const [qr, setQr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const stats = useMemo(() => {
    const list = reviews;
    const avg = list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;
    return {
      average: avg.toFixed(2),
      count: list.length,
      pending: list.filter((r) => r.status === "draft_ready").length,
      negatives: list.filter((r) => r.sentiment === "negative").length,
    };
  }, [reviews]);

  async function postJson(url: string, body?: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Actie mislukt");
    return data;
  }

  async function approve(id: string) {
    setBusyId(id);
    try {
      await postJson(`/api/reviews/${id}/approve`);
      setNotice("Antwoord goedgekeurd.");
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function skip(id: string) {
    setBusyId(id);
    try {
      await postJson(`/api/reviews/${id}/skip`);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function sync() {
    setNotice("Reviews synchroniseren…");
    try {
      const data = await postJson("/api/workflow/run", { businessId: business.id });
      const first = data.results?.[0];
      setNotice(
        first
          ? `Sync klaar: ${first.created} nieuwe reviews, ${first.drafted} AI-drafts.`
          : "Sync klaar.",
      );
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    }
  }

  async function checkout(plan: "starter" | "pro") {
    const data = await postJson("/api/stripe/checkout", { businessId: business.id, plan });
    if (data.url) window.location.href = data.url;
  }

  async function portal() {
    const data = await postJson("/api/stripe/portal", { businessId: business.id });
    if (data.url) window.location.href = data.url;
  }

  async function emailReport() {
    const data = await postJson("/api/outreach/email-report", { businessId: business.id });
    setNotice(data.simulated ? `E-mail gesimuleerd naar ${data.to}` : `Rapport verstuurd naar ${data.to}`);
  }

  async function telegram() {
    const data = await postJson("/api/outreach/telegram", {
      businessId: business.id,
      text: `ReputaLocal ping voor ${business.name}: ${stats.pending} drafts wachten op goedkeuring.`,
    });
    setNotice(data.delivered ? "Telegram verstuurd." : "Telegram gesimuleerd (geen bot-token).");
  }

  async function makeQr() {
    const response = await fetch(`/api/qr?businessId=${business.id}&table=${encodeURIComponent(table)}`);
    const data = await response.json();
    if (!response.ok) {
      setNotice(data.error);
      return;
    }
    setQr(data.qr);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl">Dashboard</p>
          <p className="text-sm text-ink-800/70">{email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-full border border-ink-100 bg-white px-3 py-2 text-sm"
            value={business.id}
            onChange={(e) => router.push(`/dashboard?business=${e.target.value}`)}
          >
            {businesses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.city}
              </option>
            ))}
          </select>
          <button onClick={sync} className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white">
            Sync reviews
          </button>
          <button onClick={logout} className="rounded-full border px-4 py-2 text-sm">
            Uitloggen
          </button>
        </div>
      </header>

      {notice ? <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm">{notice}</p> : null}

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Gemiddelde score", stats.average],
          ["Reviews", String(stats.count)],
          ["Klaar voor goedkeuring", String(stats.pending)],
          ["Negatief", String(stats.negatives)],
        ].map(([label, value]) => (
          <article key={label} className="card p-5">
            <p className="text-xs uppercase tracking-widest text-brass-600">{label}</p>
            <p className="mt-2 font-display text-3xl">{value}</p>
          </article>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="space-y-4">
          <h2 className="font-display text-2xl">Laatste reviews</h2>
          {reviews.length === 0 ? (
            <p className="card p-6 text-sm">Nog geen reviews. Klik op “Sync reviews” om de workflow te starten.</p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{review.author}</p>
                    <p className="text-sm text-ink-800/60">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)} · {review.sentiment ?? "—"} · {review.language}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink-50 px-3 py-1 text-xs">{review.status}</span>
                </div>
                <p className="mt-3 text-sm">{review.text}</p>
                {review.aiResponse ? (
                  <blockquote className="mt-3 rounded-xl bg-ink-50 p-3 text-sm italic">
                    {review.aiResponse}
                  </blockquote>
                ) : null}
                {review.status === "draft_ready" ? (
                  <div className="mt-4 flex gap-2">
                    <button
                      disabled={busyId === review.id}
                      onClick={() => approve(review.id)}
                      className="rounded-full bg-sage-500 px-4 py-2 text-sm text-white"
                    >
                      Goedkeuren
                    </button>
                    <button
                      disabled={busyId === review.id}
                      onClick={() => skip(review.id)}
                      className="rounded-full border px-4 py-2 text-sm"
                    >
                      Overslaan
                    </button>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </section>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="font-display text-2xl">Abonnement</h2>
            <p className="mt-2 text-sm">
              Status: <strong>{business.subscription?.status ?? "geen"}</strong>
              {business.subscription?.plan ? ` · ${business.subscription.plan}` : ""}
            </p>
            <div className="mt-4 space-y-2">
              {Object.values(PLANS).map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => checkout(plan.id)}
                  className="block w-full rounded-full bg-ink-900 px-4 py-2 text-sm text-white"
                >
                  {plan.name} — €{plan.priceMonthly}/mo
                </button>
              ))}
              <button onClick={portal} className="block w-full rounded-full border px-4 py-2 text-sm">
                Beheer facturatie
              </button>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-2xl">Tafel-QR</h2>
            <label className="mt-3 block text-sm">
              Tafelnummer
              <input
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink-100 px-3 py-2"
              />
            </label>
            <button onClick={makeQr} className="mt-3 w-full rounded-full bg-brass-500 px-4 py-2 text-sm text-white">
              Genereer QR
            </button>
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR code" className="mx-auto mt-4 w-48" />
            ) : null}
          </section>

          <section className="card p-5">
            <h2 className="font-display text-2xl">Outreach</h2>
            <div className="mt-3 space-y-2">
              <button onClick={emailReport} className="w-full rounded-full border px-4 py-2 text-sm">
                Verstuur e-mailrapport
              </button>
              <button onClick={telegram} className="w-full rounded-full border px-4 py-2 text-sm">
                Telegram-alert
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
