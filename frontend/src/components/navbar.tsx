'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { connectWallet, disconnectWallet, isWalletConnected, getWalletAddress } from '@/lib/stacks';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/strategies', label: 'Strategies' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const checkWallet = () => {
      const walletConnected = isWalletConnected();
      setConnected(walletConnected);
      if (walletConnected) {
        setAddress(getWalletAddress());
      }
    };
    checkWallet();
  }, []);

  const handleConnect = async () => {
    try {
      await connectWallet();
      setConnected(true);
      setAddress(getWalletAddress());
    } catch {
      console.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setConnected(false);
    setAddress('');
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">
              IntelliDeFi
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            {connected ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{truncateAddress(address)}</span>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
