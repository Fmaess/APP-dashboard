import type { Metadata } from "next";
import { Barlow, Chakra_Petch, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Chakra_Petch({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const ui = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ui" });
const num = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-num" });

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Private Projekte auf einen Blick",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${display.variable} ${ui.variable} ${num.variable}`}>
      <body>{children}</body>
    </html>
  );
}
