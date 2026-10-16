import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const geist = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "ReputaLocal — Review management for Flemish HoReCa",
  description:
    "Automated Google reviews, AI replies in Dutch & English, and QR campaigns for cafés and restaurants in Flanders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${geist.variable} ${fraunces.variable} font-sans`}>{children}</body>
    </html>
  );
}
