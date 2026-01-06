"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  Shield,
  BarChart3,
  FileCheck,
  ClipboardList,
  Wallet,
  ArrowRight,
  Zap,
  Network,
  Lock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { isUserSignedIn, connectWallet } from "@/lib/stacks";

function HeroSection() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(isUserSignedIn());
  }, []);

  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-stacks-600/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-bitcoin-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-stacks-500/30 bg-stacks-500/10 px-4 py-2 text-sm text-stacks-300">
          <Zap className="h-4 w-4" />
          <span>AI-Powered DeFi on Bitcoin via Stacks</span>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Intelligent DeFi
          <br />
          <span className="gradient-text">Strategies on Bitcoin</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-surface-400 sm:text-xl">
          Harness machine-learning-driven market signals, automated portfolio
          optimization, and institutional-grade risk management. Built on
          Stacks, secured by Bitcoin.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {signedIn ? (
            <Link href="/dashboard" className="intellidefi-button-primary text-lg px-8 py-4">
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <button
              onClick={() => connectWallet()}
              className="intellidefi-button-primary text-lg px-8 py-4"
            >
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </button>
          )}
          <Link
            href="/strategies"
            className="intellidefi-button-secondary text-lg px-8 py-4"
          >
            Explore Strategies
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Secured by Bitcoin", icon: Lock },
            { label: "AI-Driven Signals", icon: Brain },
            { label: "Real-Time Optimization", icon: TrendingUp },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-3 rounded-xl border border-surface-800 bg-surface-900/40 px-4 py-3 text-surface-400"
            >
              <item.icon className="h-5 w-5 text-stacks-400" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: "AI Oracle Engine",
    description:
      "Real-time market signal analysis and price predictions powered by on-chain AI models. Receive actionable buy, sell, and hold recommendations with confidence scores.",
    icon: Brain,
    color: "stacks" as const,
  },
  {
    title: "Risk Management",
    description:
      "Define your risk profile from conservative to aggressive. The protocol validates every transaction against your parameters and calculates portfolio-wide risk exposure.",
    icon: Shield,
    color: "bitcoin" as const,
  },
  {
    title: "Strategy Optimization",
    description:
      "Automated portfolio rebalancing and allocation optimization. The optimizer continuously adjusts positions based on market conditions and AI signals.",
    icon: BarChart3,
    color: "stacks" as const,
  },
  {
    title: "Compliance Monitor",
    description:
      "Built-in KYC verification and jurisdiction-aware compliance checks. Operate within regulatory frameworks while maintaining decentralization.",
    icon: FileCheck,
    color: "bitcoin" as const,
  },
  {
    title: "Immutable Audit Trail",
    description:
      "Every action logged on-chain with timestamps and full context. Complete transparency for all investment decisions, trades, and portfolio changes.",
    icon: ClipboardList,
    color: "stacks" as const,
  },
  {
    title: "Protocol Registry",
    description:
      "Curated, whitelisted DeFi protocols vetted for security and reliability. Only interact with verified protocols that meet institutional standards.",
    icon: Network,
    color: "bitcoin" as const,
  },
];

function FeaturesSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Protocol Architecture
          </h2>
          <p className="mx-auto max-w-2xl text-surface-400">
            Seven interconnected smart contracts working in concert to deliver
            institutional-grade DeFi strategies on Bitcoin.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <div
              key={feature.title}
              className="intellidefi-card-interactive p-6 opacity-0 animate-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div
                className={`mb-4 inline-flex rounded-lg p-3 ${
                  feature.color === "stacks"
                    ? "bg-stacks-500/10 text-stacks-400"
                    : "bg-bitcoin-500/10 text-bitcoin-400"
                }`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-surface-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    step: "01",
    title: "Connect Your Wallet",
    description:
      "Link your Stacks wallet to access the IntelliDeFi protocol. Your keys, your control -- always non-custodial.",
  },
  {
    step: "02",
    title: "Set Risk Parameters",
    description:
      "Define your risk tolerance, investment limits, and compliance requirements. The protocol tailors everything to your profile.",
  },
  {
    step: "03",
    title: "Deploy AI Strategies",
    description:
      "Choose from optimized strategies or create custom ones. The AI oracle and optimizer work together to maximize returns within your risk bounds.",
  },
  {
    step: "04",
    title: "Monitor and Optimize",
    description:
      "Track performance in real-time with complete on-chain transparency. Automated rebalancing keeps your portfolio aligned with market conditions.",
  },
];

function HowItWorksSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-surface-400">
            From wallet connection to optimized returns in four steps.
          </p>
        </div>

        <div className="relative space-y-8">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-stacks-500/50 via-bitcoin-500/50 to-transparent md:block" />

          {STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="relative flex gap-6 opacity-0 animate-in"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-stacks-500/30 bg-surface-900 text-lg font-bold text-stacks-400">
                {step.step}
              </div>
              <div className="flex-1 rounded-xl border border-surface-700/50 bg-surface-900/60 p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-surface-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(isUserSignedIn());
  }, []);

  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl border border-stacks-500/20 bg-gradient-to-br from-surface-900 via-stacks-950/40 to-surface-900 p-12 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-stacks-600/10 blur-[80px]" />
          </div>

          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Ready to Deploy Intelligent DeFi?
            </h2>
            <p className="mb-8 text-surface-400">
              Start building AI-optimized investment strategies on the most
              secure blockchain. No intermediaries, no compromises.
            </p>

            {signedIn ? (
              <Link
                href="/dashboard"
                className="intellidefi-button-primary text-lg px-10 py-4"
              >
                Open Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={() => connectWallet()}
                className="intellidefi-button-primary text-lg px-10 py-4"
              >
                <Wallet className="h-5 w-5" />
                Launch App
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Navbar() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(isUserSignedIn());
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-stacks-500 to-bitcoin-500">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">IntelliDeFi</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/strategies"
            className="text-sm font-medium text-surface-400 transition-colors hover:text-white"
          >
            Strategies
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-surface-400 transition-colors hover:text-white"
          >
            Dashboard
          </Link>
        </div>

        <div>
          {signedIn ? (
            <Link href="/dashboard" className="intellidefi-button-primary px-5 py-2.5 text-sm">
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={() => connectWallet()}
              className="intellidefi-button-primary px-5 py-2.5 text-sm"
            >
              <Wallet className="h-4 w-4" />
              Connect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface-800/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-stacks-500 to-bitcoin-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">IntelliDeFi Protocol</span>
          </div>
          <p className="text-sm text-surface-500">
            AI-Driven DeFi Strategies on Bitcoin. Built with Stacks smart contracts.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <div className="section-divider mx-auto max-w-6xl" />
      <FeaturesSection />
      <div className="section-divider mx-auto max-w-6xl" />
      <HowItWorksSection />
      <div className="section-divider mx-auto max-w-6xl" />
      <CTASection />
      <Footer />
    </main>
  );
}
