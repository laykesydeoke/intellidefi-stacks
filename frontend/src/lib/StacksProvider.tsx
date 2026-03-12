'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  isStacksWalletConnected,
  getUserStxAddress,
  connectStacksWallet,
  disconnectStacksWallet
} from './stacks';

interface StacksContextType {
  connected: boolean;
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

export function StacksProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      if (manuallyDisconnected) return;

      const isWalletConnected = isStacksWalletConnected();
      setConnected(isWalletConnected);
      if (isWalletConnected) {
        const addr = getUserStxAddress();
        setAddress(addr);
      } else {
        setAddress(null);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, [manuallyDisconnected]);

  const handleConnect = async () => {
    if (connecting) return;

    setConnecting(true);
    setManuallyDisconnected(false);
    try {
      const success = await connectStacksWallet();
      if (success) {
        setConnected(true);
        const addr = getUserStxAddress();
        setAddress(addr);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectStacksWallet();
    setConnected(false);
    setAddress(null);
    setManuallyDisconnected(true);
  };

  return (
    <StacksContext.Provider
      value={{
        connected,
        address,
        connecting,
        connect: handleConnect,
        disconnect: handleDisconnect,
      }}
    >
      {children}
    </StacksContext.Provider>
  );
}

export function useStacks() {
  const context = useContext(StacksContext);
  if (context === undefined) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
}
