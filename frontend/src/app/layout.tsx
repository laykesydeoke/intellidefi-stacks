import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://intellidefistacks.vercel.app')
  ),
  title: {
    default: 'IntelliDeFi - AI-Powered DeFi on Bitcoin',
    template: '%s | IntelliDeFi',
  },
  description:
    'Intelligent DeFi strategies powered by AI on the Bitcoin blockchain via Stacks. Optimize your portfolio with machine-learning-driven risk management, automated rebalancing, and real-time market signals.',
  keywords: [
    'DeFi',
    'Bitcoin',
    'Stacks',
    'AI',
    'portfolio management',
    'smart contracts',
    'blockchain',
    'risk management',
    'automated trading',
    'yield optimization',
    'strategy optimizer',
    'AI oracle',
  ],
  authors: [{ name: 'IntelliDeFi Team' }],
  creator: 'IntelliDeFi',
  publisher: 'IntelliDeFi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'IntelliDeFi - AI-Powered DeFi on Bitcoin',
    description:
      'Intelligent DeFi strategies powered by AI on Bitcoin via Stacks. Machine-learning risk management, automated rebalancing, and real-time market signals.',
    siteName: 'IntelliDeFi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IntelliDeFi - AI-Powered DeFi on Bitcoin',
    description:
      'Intelligent DeFi strategies powered by AI on Bitcoin via Stacks. Machine-learning risk management, automated rebalancing, and real-time market signals.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  },
  other: {
    'talentapp:project_verification': '0fb824b393405ae11f24a94c498c1271bcbbf49d2ada49916b23d07b0bd9077cca415ebf41ce33b6ad6acbe3534e2f8e5a5259199922384a7b7c7cb042d6ea21',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <Providers>
          <div className="relative min-h-screen bg-surface-950 flex flex-col">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stacks-950/40 via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
