# IntelliDeFi Protocol

**AI-Driven DeFi Strategies on Bitcoin**

A DeFi protocol built on Stacks that leverages artificial intelligence to optimize investment strategies while utilizing Bitcoin's security and stability.

## Overview

IntelliDeFi Protocol is an AI-powered DeFi platform on the Stacks blockchain. The protocol combines machine learning algorithms with Clarity 4 smart contracts to deliver risk-managed, cross-protocol DeFi optimization.

## Smart Contracts

| Contract | Description |
|----------|-------------|
| `strategy-engine` | Core strategy creation, investment, and withdrawal |
| `risk-manager` | Risk profiles, portfolio validation, exposure limits |
| `protocol-registry` | DeFi protocol whitelisting and integration |
| `ai-oracle` | ML-powered oracle with market signals and predictions |
| `strategy-optimizer` | Portfolio optimization, rebalancing, performance tracking |
| `audit-trail` | Immutable action logging with authorized loggers |
| `compliance-monitor` | KYC/AML compliance, transaction limits, user verification |

## Project Structure

```
contracts/           # 7 Clarity 4 smart contracts
tests/               # Vitest test suites for each contract
frontend/            # Next.js 15 dashboard application
  src/app/           # App router pages (landing, dashboard, strategies)
  src/lib/           # Stacks wallet integration and contract helpers
```

## Technology Stack

- **Blockchain**: Stacks (Bitcoin L2)
- **Smart Contracts**: Clarity 4
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Wallet**: @stacks/connect
- **Testing**: Vitest + Clarinet SDK

## Getting Started

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v3.8+
- Node.js 18+ and npm

### Smart Contracts

```bash
npm install
clarinet check
npm test
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## License

MIT
