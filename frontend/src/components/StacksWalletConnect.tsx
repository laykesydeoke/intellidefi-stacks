'use client';

import React, { useState } from 'react';
import { useStacks } from '@/lib/StacksProvider';
import { formatAddress, STACKS_NETWORK_CONFIG } from '@/lib/stacks';
import { Wallet, LogOut, ChevronDown, Copy, Check } from 'lucide-react';

interface StacksWalletConnectProps {
  className?: string;
  showBalance?: boolean;
}

export default function StacksWalletConnect({
  className = '',
  showBalance = true
}: StacksWalletConnectProps) {
  const { connected, address, connecting, connect, disconnect } = useStacks();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (connected && address) {
      fetch(`${STACKS_NETWORK_CONFIG.coreApiUrl}/extended/v1/address/${address}/stx`)
        .then(res => res.json())
        .then(data => {
          const stxBalance = parseInt(data.balance) / 1_000_000;
          setBalance(stxBalance);
        })
        .catch(err => console.error('Error fetching balance:', err));
    }
  }, [connected, address]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (connected && address) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2.5 bg-surface-900/60 border border-surface-700 rounded-xl hover:bg-surface-800 transition-all duration-200 group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-stacks-500 to-bitcoin-500 rounded-lg flex items-center justify-center">
            <Wallet className="h-4 w-4 text-white" />
          </div>

          <div className="flex flex-col items-start">
            {showBalance && balance !== null ? (
              <span className="text-sm font-bold text-white">
                {balance.toFixed(2)} STX
              </span>
            ) : (
              <div className="w-16 h-4 bg-surface-800 rounded animate-pulse" />
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-xs text-surface-400 font-medium">
                {formatAddress(address)}
              </span>
            </div>
          </div>

          <ChevronDown className={`h-4 w-4 text-surface-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            <div className="absolute right-0 mt-2 w-64 bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-20 overflow-hidden">
              <div className="p-4 border-b border-surface-800">
                <div className="text-xs text-surface-500 mb-1 font-medium">Wallet Address</div>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-surface-300 font-mono">
                    {address.slice(0, 8)}...{address.slice(-8)}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1.5 hover:bg-surface-800 rounded-lg transition-all"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-surface-500" />
                    )}
                  </button>
                </div>
              </div>

              {showBalance && balance !== null && (
                <div className="p-4 border-b border-surface-800">
                  <div className="text-xs text-surface-500 mb-1 font-medium">Balance</div>
                  <div className="text-2xl font-bold text-white">
                    {balance.toFixed(6)} STX
                  </div>
                  <div className="text-xs text-surface-500 mt-1">
                    {STACKS_NETWORK_CONFIG.name}
                  </div>
                </div>
              )}

              <div className="p-2">
                <button
                  onClick={() => {
                    disconnect();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Disconnect Wallet</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="intellidefi-button-primary px-5 py-2.5 text-sm"
    >
      {connecting ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </div>
      )}
    </button>
  );
}

export function CompactStacksWalletConnect({ className = '' }: { className?: string }) {
  const { connected, address, connecting, connect, disconnect } = useStacks();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    if (connected && address) {
      fetch(`${STACKS_NETWORK_CONFIG.coreApiUrl}/extended/v1/address/${address}/stx`)
        .then(res => res.json())
        .then(data => {
          const stxBalance = parseInt(data.balance) / 1_000_000;
          setBalance(stxBalance);
        })
        .catch(err => console.error('Error fetching balance:', err));
    }
  }, [connected, address]);

  if (connected && address) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-surface-900/60 border border-surface-700 rounded-lg hover:bg-surface-800 transition-all"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-stacks-500 to-bitcoin-500 rounded-md flex items-center justify-center">
            <Wallet className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-white">
            {balance !== null ? `${balance.toFixed(2)} STX` : formatAddress(address)}
          </span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-surface-900 border border-surface-700 rounded-lg shadow-xl z-20 p-2">
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-md transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">Disconnect</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="intellidefi-button-primary px-4 py-2 text-sm"
    >
      {connecting ? (
        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <div className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" />
          Connect
        </div>
      )}
    </button>
  );
}
