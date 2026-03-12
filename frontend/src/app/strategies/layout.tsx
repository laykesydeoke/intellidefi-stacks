import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strategies',
  description: 'Create, manage, and invest in AI-optimized DeFi strategies on Bitcoin via Stacks. Browse active strategies, set risk parameters, and let machine learning optimize your portfolio allocations.',
  keywords: ['DeFi strategies', 'AI trading', 'portfolio optimization', 'yield strategies', 'risk management', 'Bitcoin DeFi'],
  openGraph: {
    title: 'IntelliDeFi Strategies - AI-Optimized DeFi',
    description: 'Create and invest in AI-powered DeFi strategies. Machine-learning-driven risk management on Bitcoin.',
  },
};

export default function StrategiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
