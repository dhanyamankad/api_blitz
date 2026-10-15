import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "API Blitz 2026 | Microsoft Club DAU",
  description: "The premier 2-person-team API hackathon by Microsoft Club, Dhirubhai Ambani University.",
  keywords: ["API Blitz", "Hackathon", "DAU", "Microsoft Club", "APIs", "Engineering"],
  authors: [{ name: "Microsoft Club DAU" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-[#030712] font-sans text-slate-100 antialiased tech-grid">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
