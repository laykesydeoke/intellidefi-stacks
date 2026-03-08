import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your DeFi portfolio with AI-powered insights. View active strategies, track returns, monitor risk levels, and access real-time market signals on IntelliDeFi.',
  keywords: ['DeFi dashboard', 'portfolio management', 'AI insights', 'strategy tracking', 'risk monitoring'],
  openGraph: {
    title: 'IntelliDeFi Dashboard - Your AI-Powered Portfolio',
    description: 'Manage strategies, track returns, and get AI-driven market insights all in one place.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
