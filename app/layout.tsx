import "./globals.css";
import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { GameProvider } from "@/app/context/GameContext";
import { LegendHighlightProvider } from "@/app/context/LegendHighlightContext";
import { NotificationProvider } from "@/app/components/UI/NotificationProvider";

export const metadata = {
  title: "Slay the Spire Combat Planner Reworked",
  description: "Plan your 'unwinnable' combats for Slay the Spire like Puzzles",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // optional (for Tailwind)
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} bg-slate-950 dark`}>
      <body className="min-h-dvh bg-slate-950 text-slate-100 antialiased">
        <NotificationProvider>
          <GameProvider>
            <LegendHighlightProvider>{children}</LegendHighlightProvider>
          </GameProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}