import QRCode from "qrcode";
import { env } from "@/lib/env";

export function googleReviewLink(placeId: string, customUrl?: string | null) {
  if (customUrl) return customUrl;
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

export function tableReviewLink(businessId: string, table?: string) {
  const url = new URL(`/r/${businessId}`, env.appUrl);
  if (table) url.searchParams.set("table", table);
  return url.toString();
}

export async function generateQrDataUrl(target: string) {
  return QRCode.toDataURL(target, {
    width: 512,
    margin: 1,
    color: { dark: "#1a1612", light: "#f6f4f1" },
  });
}
