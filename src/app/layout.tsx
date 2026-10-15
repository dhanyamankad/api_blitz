import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Blitz",
  description: "API Blitz: a 2-person-team API event by Microsoft Club, DAU",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
