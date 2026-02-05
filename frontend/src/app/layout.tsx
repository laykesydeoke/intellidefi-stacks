import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IntelliDeFi Protocol | AI-Powered DeFi on Bitcoin",
  description:
    "Intelligent DeFi strategies powered by AI on the Bitcoin blockchain via Stacks. Optimize your portfolio with machine-learning-driven risk management, automated rebalancing, and real-time market signals.",
  keywords: [
    "DeFi",
    "Bitcoin",
    "Stacks",
    "AI",
    "Portfolio Management",
    "Smart Contracts",
    "Blockchain",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen bg-surface-950">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stacks-950/40 via-transparent to-transparent" />
          <div className="relative z-10">
            <Navbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
