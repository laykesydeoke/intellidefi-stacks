import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Oracle',
  description: 'Access real-time AI-generated market signals, price predictions, and trading recommendations powered by on-chain machine learning models on the Stacks Bitcoin L2.',
  keywords: ['AI oracle', 'market signals', 'price prediction', 'trading AI', 'on-chain analytics', 'machine learning blockchain'],
  openGraph: {
    title: 'IntelliDeFi AI Oracle - On-Chain Market Intelligence',
    description: 'Real-time AI market signals and predictions powered by on-chain machine learning on Bitcoin.',
  },
};

export default function OracleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
