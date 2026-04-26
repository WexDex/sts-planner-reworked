import "./globals.css";
import { Inter } from "next/font/google";
import { GameProvider } from "@/app/context/GameContext";
import { NotificationProvider } from "@/app/components/UI/NotificationProvider";

export const metadata = {
  title: "Slay the Spire Combat Planner Reworked",
  description: "Plan your 'unwinnable' combats for Slay the Spire like Puzzles",
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
    <html lang="en" className={`${inter.className} bg-indigo-50`}>
      <body>
        <NotificationProvider>
          <GameProvider>{children}</GameProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}