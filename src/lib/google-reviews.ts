import { env } from "@/lib/env";

export type ExternalReview = {
  googleReviewId: string;
  author: string;
  rating: number;
  text: string;
  language: string;
  relativeTime?: string;
};

type PlacesReview = {
  name?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  authorAttribution?: { displayName?: string };
  relativePublishTimeDescription?: string;
};

export async function fetchGoogleReviews(placeId: string): Promise<ExternalReview[]> {
  if (!env.googlePlacesApiKey) {
    return mockReviews(placeId);
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const response = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": env.googlePlacesApiKey,
      "X-Goog-FieldMask": "reviews,displayName,rating",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.warn("Google Places fetch failed, using mock reviews", await response.text());
    return mockReviews(placeId);
  }

  const data = (await response.json()) as { reviews?: PlacesReview[] };
  return (data.reviews ?? []).map((review, index) => ({
    googleReviewId: review.name ?? `${placeId}-${index}`,
    author: review.authorAttribution?.displayName ?? "Google gebruiker",
    rating: review.rating ?? 0,
    text: review.text?.text ?? "",
    language: review.text?.languageCode?.startsWith("nl") ? "nl" : "en",
    relativeTime: review.relativePublishTimeDescription,
  }));
}

function mockReviews(placeId: string): ExternalReview[] {
  const samples: ExternalReview[] = [
    {
      googleReviewId: `${placeId}-mock-1`,
      author: "Liesbeth V.",
      rating: 5,
      text: "Heerlijke stoofvlees met frietjes en een vriendelijke bediening. De sfeer is puur Vlaams — we komen zeker terug.",
      language: "nl",
    },
    {
      googleReviewId: `${placeId}-mock-2`,
      author: "Tom R.",
      rating: 2,
      text: "Moesten 35 minuten wachten op onze bestelling en de soep was lauw. Jammer, want de locatie is mooi.",
      language: "nl",
    },
    {
      googleReviewId: `${placeId}-mock-3`,
      author: "Emma Clarke",
      rating: 4,
      text: "Lovely lunch in Ghent. The waffles were excellent, coffee a bit slow, but the terrace made up for it.",
      language: "en",
    },
    {
      googleReviewId: `${placeId}-mock-4`,
      author: "Pieter D.",
      rating: 3,
      text: "Prima lunch, niets bijzonders. Prijs-kwaliteit is oké voor het centrum van Antwerpen.",
      language: "nl",
    },
  ];

  return samples;
}
