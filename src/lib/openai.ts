import OpenAI from "openai";
import { Sentiment } from "@prisma/client";
import { env } from "@/lib/env";

function client() {
  if (!env.openaiApiKey) return null;
  return new OpenAI({ apiKey: env.openaiApiKey });
}

export async function analyzeSentiment(text: string, rating: number): Promise<Sentiment> {
  const openai = client();
  if (!openai) {
    if (rating >= 4) return "positive";
    if (rating <= 2) return "negative";
    return "neutral";
  }

  const completion = await openai.chat.completions.create({
    model: env.openaiModel,
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "Classify HoReCa review sentiment as positive, neutral, or negative. Reply with JSON {\"sentiment\":\"positive|neutral|negative\"}.",
      },
      { role: "user", content: `Rating: ${rating}/5\nReview: ${text}` },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { sentiment?: string };
  if (parsed.sentiment === "positive" || parsed.sentiment === "neutral" || parsed.sentiment === "negative") {
    return parsed.sentiment;
  }
  return rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral";
}

export async function generateDraftReply(input: {
  businessName: string;
  city: string;
  reviewText: string;
  author: string;
  rating: number;
  sentiment: Sentiment;
  language: string;
}): Promise<string> {
  const openai = client();
  const targetLang = input.language.startsWith("nl") ? "Dutch" : "English";

  if (!openai) {
    return fallbackReply(input, targetLang);
  }

  const completion = await openai.chat.completions.create({
    model: env.openaiModel,
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content: `You write short, professional review replies for Flemish cafés and restaurants (HoReCa).
Tone: warm, specific, never defensive. Mention the venue name naturally.
If the review is negative, apologise, acknowledge the issue, and invite them back.
Keep it under 90 words. Write only the reply in ${targetLang}.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          business: input.businessName,
          city: input.city,
          author: input.author,
          rating: input.rating,
          sentiment: input.sentiment,
          review: input.reviewText,
        }),
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || fallbackReply(input, targetLang);
}

function fallbackReply(
  input: { businessName: string; author: string; rating: number; sentiment: Sentiment },
  language: string,
) {
  const first = input.author.split(" ")[0] || "daar";
  if (language === "Dutch") {
    if (input.sentiment === "negative" || input.rating <= 2) {
      return `Beste ${first}, dank je om dit te delen. Het spijt ons dat je ervaring bij ${input.businessName} niet was wat je verwachtte. We nemen je feedback intern op en hopen je snel opnieuw welkom te heten — dan zetten we het graag recht.`;
    }
    return `Beste ${first}, wat fijn om te lezen! Namens het team van ${input.businessName} bedankt voor je warme woorden. We hopen je snel terug te zien.`;
  }

  if (input.sentiment === "negative" || input.rating <= 2) {
    return `Dear ${first}, thank you for sharing this. We're sorry your visit to ${input.businessName} missed the mark. We'll take your feedback to the team and would love the chance to welcome you back.`;
  }
  return `Dear ${first}, thank you for the kind words — the team at ${input.businessName} is delighted. We look forward to hosting you again soon.`;
}
