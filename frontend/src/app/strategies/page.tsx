"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Plus,
  Layers,
  Shield,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  LogOut,
  DollarSign,
  Target,
  Gauge,
} from "lucide-react";
import {
  isUserSignedIn,
  connectWallet,
  getUserAddress,
  signOut,
  formatAddress,
  formatSTX,
} from "@/lib/stacks";
import {
  CONTRACTS,
  CONTRACT_FUNCTIONS,
  STACKS_API_URL,
  parseContractId,
} from "@/lib/contracts";

interface StrategyForm {
  name: string;
  minAmount: string;
  maxAmount: string;
  riskLevel: number;
}

interface ExistingStrategy {
  id: number;
  name: string;
  minAmount: number;
  maxAmount: number;
  riskLevel: number;
  totalInvested: number;
  isActive: boolean;
  investorCount: number;
}

const MOCK_EXISTING_STRATEGIES: ExistingStrategy[] = [
  {
    id: 1,
    name: "BTC Momentum Alpha",
    minAmount: 1000000,
    maxAmount: 100000000,
    riskLevel: 6,
    totalInvested: 75000000,
    isActive: true,
    investorCount: 24,
  },
  {
    id: 2,
    name: "STX Yield Optimizer",
    minAmount: 500000,
    maxAmount: 50000000,
    riskLevel: 4,
    totalInvested: 32000000,
    isActive: true,
    investorCount: 18,
  },
  {
    id: 3,
    name: "DeFi Index Tracker",
    minAmount: 2000000,
    maxAmount: 200000000,
    riskLevel: 7,
    totalInvested: 15000000,
    isActive: true,
    investorCount: 9,
  },
  {
    id: 4,
    name: "Conservative BTC Accumulator",
    minAmount: 100000,
    maxAmount: 10000000,
    riskLevel: 2,
    totalInvested: 8500000,
    isActive: true,
    investorCount: 42,
  },
  {
    id: 5,
    name: "High-Yield Leverage Play",
    minAmount: 5000000,
    maxAmount: 500000000,
    riskLevel: 9,
    totalInvested: 120000000,
    isActive: false,
    investorCount: 7,
  },
];

function StrategyNavbar({
  address,
  signedIn,
}: {
  address: string;
  signedIn: boolean;
}) {
  return (
    <nav className="sticky top-0 z-50 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-stacks-500 to-bitcoin-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">IntelliDeFi</span>
          </Link>
          <span className="hidden text-surface-600 sm:inline">/</span>
          <span className="hidden text-sm font-medium text-surface-400 sm:inline">
            Strategy Management
          </span>
        </div>

        <div className="flex items-center gap-4">
          {signedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-surface-400 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900/60 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-mono text-surface-300">
                  {formatAddress(address)}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900/60 px-3 py-2 text-sm text-surface-400 transition-colors hover:border-red-500/30 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
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

function CreateStrategyForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (form: StrategyForm) => void;
}) {
  const [form, setForm] = useState<StrategyForm>({
    name: "",
    minAmount: "",
    maxAmount: "",
    riskLevel: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof StrategyForm, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StrategyForm, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = "Strategy name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!form.minAmount || isNaN(Number(form.minAmount)) || Number(form.minAmount) <= 0) {
      newErrors.minAmount = "Enter a valid minimum amount";
    }

    if (!form.maxAmount || isNaN(Number(form.maxAmount)) || Number(form.maxAmount) <= 0) {
      newErrors.maxAmount = "Enter a valid maximum amount";
    }

    if (
      form.minAmount &&
      form.maxAmount &&
      Number(form.minAmount) >= Number(form.maxAmount)
    ) {
      newErrors.maxAmount = "Maximum must be greater than minimum";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const minMicro = Math.floor(Number(form.minAmount) * 1_000_000);
    const maxMicro = Math.floor(Number(form.maxAmount) * 1_000_000);

    try {
      const { openContractCall } = await import("@stacks/connect");
      const { stringAsciiCV, uintCV } = await import("@stacks/transactions");
      const { network } = await import("@/lib/stacks");

      await openContractCall({
        contractAddress: CONTRACTS.strategyEngine.address,
        contractName: CONTRACTS.strategyEngine.name,
        functionName: CONTRACT_FUNCTIONS.strategyEngine.createStrategy,
        functionArgs: [
          stringAsciiCV(form.name),
          uintCV(minMicro),
          uintCV(maxMicro),
          uintCV(form.riskLevel),
        ],
        network,
        onFinish: (data) => {
          console.log("Strategy created:", data);
          onSubmit(form);
          setSubmitting(false);
        },
        onCancel: () => {
          setSubmitting(false);
        },
      });
    } catch (err) {
      console.error("Strategy creation failed:", err);
      setSubmitting(false);
    }
  };

  const riskLabel = (level: number) => {
    if (level <= 2) return "Conservative";
    if (level <= 4) return "Moderate-Low";
    if (level <= 6) return "Moderate";
    if (level <= 8) return "Aggressive";
    return "Very Aggressive";
  };

  const riskColor = (level: number) => {
    if (level <= 3) return "text-emerald-400";
    if (level <= 6) return "text-bitcoin-400";
    return "text-red-400";
  };

  return (
    <div className="intellidefi-card p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Create New Strategy
          </h2>
          <p className="text-sm text-surface-400 mt-1">
            Define the parameters for your new DeFi strategy
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="intellidefi-label">Strategy Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., BTC Momentum Alpha"
            className="intellidefi-input"
            maxLength={64}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="intellidefi-label">Minimum Investment (STX)</label>
            <input
              type="number"
              value={form.minAmount}
              onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
              placeholder="1.0"
              step="0.000001"
              min="0"
              className="intellidefi-input"
            />
            {errors.minAmount && (
              <p className="mt-1 text-xs text-red-400">{errors.minAmount}</p>
            )}
          </div>

          <div>
            <label className="intellidefi-label">Maximum Investment (STX)</label>
            <input
              type="number"
              value={form.maxAmount}
              onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
              placeholder="1000.0"
              step="0.000001"
              min="0"
              className="intellidefi-input"
            />
            {errors.maxAmount && (
              <p className="mt-1 text-xs text-red-400">{errors.maxAmount}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="intellidefi-label mb-0">
              Risk Level
            </label>
            <span className={`text-sm font-semibold ${riskColor(form.riskLevel)}`}>
              {form.riskLevel}/10 - {riskLabel(form.riskLevel)}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={form.riskLevel}
            onChange={(e) =>
              setForm({ ...form, riskLevel: Number(e.target.value) })
            }
            className="w-full accent-stacks-500"
          />
          <div className="flex justify-between text-xs text-surface-500 mt-1">
            <span>1 - Conservative</span>
            <span>10 - Very Aggressive</span>
          </div>
        </div>

        <div className="rounded-lg border border-surface-700/50 bg-surface-900/40 p-4">
          <h4 className="text-sm font-medium text-surface-300 mb-2">
            Strategy Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-surface-500">Name:</span>{" "}
              <span className="text-surface-200">
                {form.name || "--"}
              </span>
            </div>
            <div>
              <span className="text-surface-500">Risk:</span>{" "}
              <span className={riskColor(form.riskLevel)}>
                {riskLabel(form.riskLevel)}
              </span>
            </div>
            <div>
              <span className="text-surface-500">Min:</span>{" "}
              <span className="text-surface-200">
                {form.minAmount ? `${form.minAmount} STX` : "--"}
              </span>
            </div>
            <div>
              <span className="text-surface-500">Max:</span>{" "}
              <span className="text-surface-200">
                {form.maxAmount ? `${form.maxAmount} STX` : "--"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="intellidefi-button-primary flex-1"
          >
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Creating Strategy...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Strategy
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="intellidefi-button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function StrategyCard({
  strategy,
  signedIn,
}: {
  strategy: ExistingStrategy;
  signedIn: boolean;
}) {
  const [investAmount, setInvestAmount] = useState("");
  const [showInvestForm, setShowInvestForm] = useState(false);

  const handleInvest = async () => {
    if (!investAmount || isNaN(Number(investAmount))) return;

    const amount = Math.floor(Number(investAmount) * 1_000_000);

    try {
      const { openContractCall } = await import("@stacks/connect");
      const { uintCV } = await import("@stacks/transactions");
      const { network } = await import("@/lib/stacks");

      await openContractCall({
        contractAddress: CONTRACTS.strategyEngine.address,
        contractName: CONTRACTS.strategyEngine.name,
        functionName: CONTRACT_FUNCTIONS.strategyEngine.investInStrategy,
        functionArgs: [uintCV(strategy.id), uintCV(amount)],
        network,
        onFinish: (data) => {
          console.log("Investment submitted:", data);
          setShowInvestForm(false);
          setInvestAmount("");
        },
        onCancel: () => {
          setShowInvestForm(false);
        },
      });
    } catch (err) {
      console.error("Investment failed:", err);
    }
  };

  const handleWithdraw = async () => {
    try {
      const { openContractCall } = await import("@stacks/connect");
      const { uintCV } = await import("@stacks/transactions");
      const { network } = await import("@/lib/stacks");

      await openContractCall({
        contractAddress: CONTRACTS.strategyEngine.address,
        contractName: CONTRACTS.strategyEngine.name,
        functionName: CONTRACT_FUNCTIONS.strategyEngine.withdrawFromStrategy,
        functionArgs: [uintCV(strategy.id)],
        network,
        onFinish: (data) => {
          console.log("Withdrawal submitted:", data);
        },
        onCancel: () => {},
      });
    } catch (err) {
      console.error("Withdrawal failed:", err);
    }
  };

  const riskColor = (level: number) => {
    if (level <= 3) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (level <= 6) return "text-bitcoin-400 bg-bitcoin-500/10 border-bitcoin-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="intellidefi-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              {strategy.name}
            </h3>
            {strategy.isActive ? (
              <span className="intellidefi-badge-success">Active</span>
            ) : (
              <span className="intellidefi-badge-danger">Inactive</span>
            )}
          </div>
          <p className="text-sm text-surface-500 mt-1">
            Strategy #{strategy.id}
          </p>
        </div>
        <div
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${riskColor(
            strategy.riskLevel
          )}`}
        >
          Risk {strategy.riskLevel}/10
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div>
          <p className="text-xs text-surface-500 mb-1">Total Invested</p>
          <p className="text-sm font-semibold text-surface-200">
            {formatSTX(strategy.totalInvested)} STX
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-500 mb-1">Min Investment</p>
          <p className="text-sm font-semibold text-surface-200">
            {formatSTX(strategy.minAmount)} STX
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-500 mb-1">Max Investment</p>
          <p className="text-sm font-semibold text-surface-200">
            {formatSTX(strategy.maxAmount)} STX
          </p>
        </div>
        <div>
          <p className="text-xs text-surface-500 mb-1">Investors</p>
          <p className="text-sm font-semibold text-surface-200">
            {strategy.investorCount}
          </p>
        </div>
      </div>

      {showInvestForm ? (
        <div className="rounded-lg border border-surface-700/50 bg-surface-900/40 p-4">
          <label className="intellidefi-label">Investment Amount (STX)</label>
          <div className="flex gap-3">
            <input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              placeholder={`Min: ${formatSTX(strategy.minAmount)} STX`}
              step="0.000001"
              min="0"
              className="intellidefi-input flex-1"
            />
            <button
              onClick={handleInvest}
              disabled={!investAmount}
              className="intellidefi-button-primary px-6"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowInvestForm(false);
                setInvestAmount("");
              }}
              className="intellidefi-button-secondary px-4"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (!signedIn) {
                connectWallet();
                return;
              }
              setShowInvestForm(true);
            }}
            disabled={!strategy.isActive}
            className="intellidefi-button-primary flex-1 py-2.5"
          >
            <DollarSign className="h-4 w-4" />
            Invest
          </button>
          <button
            onClick={() => {
              if (!signedIn) {
                connectWallet();
                return;
              }
              handleWithdraw();
            }}
            className="intellidefi-button-secondary flex-1 py-2.5"
          >
            Withdraw
          </button>
        </div>
      )}
    </div>
  );
}

export default function StrategiesPage() {
  const [signedIn, setSignedIn] = useState(false);
  const [address, setAddress] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    setMounted(true);
    const connected = isUserSignedIn();
    setSignedIn(connected);
    if (connected) {
      const addr = getUserAddress();
      if (addr) setAddress(addr);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-stacks-400" />
      </div>
    );
  }

  const filteredStrategies = MOCK_EXISTING_STRATEGIES.filter((s) => {
    if (filterActive === "active") return s.isActive;
    if (filterActive === "inactive") return !s.isActive;
    return true;
  });

  const totalInvested = MOCK_EXISTING_STRATEGIES.reduce(
    (sum, s) => sum + s.totalInvested,
    0
  );
  const activeCount = MOCK_EXISTING_STRATEGIES.filter((s) => s.isActive).length;
  const totalInvestors = MOCK_EXISTING_STRATEGIES.reduce(
    (sum, s) => sum + s.investorCount,
    0
  );

  return (
    <div className="min-h-screen">
      <StrategyNavbar address={address} signedIn={signedIn} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                DeFi Strategies
              </h1>
              <p className="mt-1 text-surface-400">
                Create, manage, and invest in AI-optimized strategies
              </p>
            </div>
            {signedIn && (
              <button
                onClick={() => setShowCreate(!showCreate)}
                className={
                  showCreate
                    ? "intellidefi-button-secondary px-5 py-2.5"
                    : "intellidefi-button-primary px-5 py-2.5"
                }
              >
                {showCreate ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    New Strategy
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="intellidefi-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-stacks-500/10 p-2.5">
                <DollarSign className="h-5 w-5 text-stacks-400" />
              </div>
              <div>
                <p className="text-xs text-surface-500">Total Value Locked</p>
                <p className="text-lg font-bold text-white">
                  {formatSTX(totalInvested)} STX
                </p>
              </div>
            </div>
          </div>
          <div className="intellidefi-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2.5">
                <Layers className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-surface-500">Active Strategies</p>
                <p className="text-lg font-bold text-white">
                  {activeCount} of {MOCK_EXISTING_STRATEGIES.length}
                </p>
              </div>
            </div>
          </div>
          <div className="intellidefi-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-bitcoin-500/10 p-2.5">
                <Target className="h-5 w-5 text-bitcoin-400" />
              </div>
              <div>
                <p className="text-xs text-surface-500">Total Investors</p>
                <p className="text-lg font-bold text-white">{totalInvestors}</p>
              </div>
            </div>
          </div>
        </div>

        {showCreate && (
          <div className="mb-8">
            <CreateStrategyForm
              onClose={() => setShowCreate(false)}
              onSubmit={() => setShowCreate(false)}
            />
          </div>
        )}

        <div className="mb-6 flex items-center gap-2">
          {(["all", "active", "inactive"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterActive(filter)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filterActive === filter
                  ? "bg-stacks-500/20 text-stacks-300 border border-stacks-500/30"
                  : "text-surface-400 hover:text-surface-200 border border-transparent"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === "all"
                ? ` (${MOCK_EXISTING_STRATEGIES.length})`
                : filter === "active"
                  ? ` (${activeCount})`
                  : ` (${MOCK_EXISTING_STRATEGIES.length - activeCount})`}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredStrategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              signedIn={signedIn}
            />
          ))}
        </div>

        {filteredStrategies.length === 0 && (
          <div className="intellidefi-card p-12 text-center">
            <Layers className="mx-auto h-12 w-12 text-surface-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Strategies Found
            </h3>
            <p className="text-sm text-surface-400">
              {filterActive !== "all"
                ? "No strategies match the current filter. Try selecting a different filter."
                : "No strategies have been created yet. Be the first to create one."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
