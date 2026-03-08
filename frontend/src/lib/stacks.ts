'use client';

import React from 'react';
import {
  showConnect,
  AppConfig,
  UserSession
} from '@stacks/connect';

const appConfig = new AppConfig(['store_write']);
const userSession = new UserSession({ appConfig });

const networkEnv = process.env.NEXT_PUBLIC_NETWORK || 'testnet';

export const STACKS_NETWORK_CONFIG = {
  name: networkEnv === 'mainnet' ? 'Stacks Mainnet' : 'Stacks Testnet',
  chainId: networkEnv,
  nodeUrl: networkEnv === 'mainnet'
    ? 'https://stacks-node-api.mainnet.stacks.co'
    : 'https://api.testnet.hiro.so',
  coreApiUrl: networkEnv === 'mainnet'
    ? 'https://stacks-node-api.mainnet.stacks.co'
    : 'https://api.testnet.hiro.so',
  explorerUrl: networkEnv === 'mainnet'
    ? 'https://explorer.stacks.co'
    : 'https://explorer.stacks.co/?chain=testnet',
};

export const network = networkEnv === 'mainnet' ? 'mainnet' : 'testnet';

export const connectStacksWallet = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const authOptions = {
      appDetails: {
        name: 'IntelliDeFi Protocol',
        icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
      },
      onFinish: () => {
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
      userSession,
    };

    try {
      showConnect(authOptions);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      resolve(false);
    }
  });
};

export const disconnectStacksWallet = (): void => {
  try {
    userSession.signUserOut();
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
};

export const isStacksWalletConnected = (): boolean => {
  try {
    return userSession.isUserSignedIn();
  } catch (error) {
    return false;
  }
};

export const getStacksWalletData = () => {
  try {
    if (userSession.isUserSignedIn()) {
      return userSession.loadUserData();
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getUserStxAddress = (): string | null => {
  try {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      if (userData?.profile?.stxAddress) {
        const networkKey = networkEnv === 'mainnet' ? 'mainnet' : 'testnet';
        return userData.profile.stxAddress[networkKey] || null;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getStxBalance = async (address: string): Promise<number> => {
  try {
    const response = await fetch(
      `${STACKS_NETWORK_CONFIG.coreApiUrl}/extended/v1/address/${address}/stx`
    );
    const data = await response.json();
    return parseInt(data.balance) / 1_000_000;
  } catch (error) {
    console.error('Failed to fetch STX balance:', error);
    return 0;
  }
};

export const formatSTX = (microStx: number | bigint): string => {
  const stx = Number(microStx) / 1_000_000;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(stx);
};

// Legacy exports for backwards compatibility
export const isUserSignedIn = isStacksWalletConnected;
export const isWalletConnected = isStacksWalletConnected;
export const connectWallet = connectStacksWallet;
export const disconnectWallet = disconnectStacksWallet;
export const signOut = disconnectStacksWallet;
export const getUserAddress = getUserStxAddress;
export const getWalletAddress = (): string => getUserStxAddress() || '';
export const getUserData = getStacksWalletData;

export const useStacksWallet = () => {
  const [connected, setConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [connecting, setConnecting] = React.useState(false);

  React.useEffect(() => {
    const isWalletConnected = isStacksWalletConnected();
    setConnected(isWalletConnected);
    if (isWalletConnected) {
      setAddress(getUserStxAddress());
    }
  }, []);

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('blockstack') || e.key === null) {
        const isWalletConnected = isStacksWalletConnected();
        setConnected(isWalletConnected);
        if (isWalletConnected) {
          setAddress(getUserStxAddress());
        } else {
          setAddress(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleConnect = async () => {
    if (connecting) return;
    setConnecting(true);
    try {
      const success = await connectStacksWallet();
      if (success) {
        setAddress(getUserStxAddress());
        setConnected(true);
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
  };

  return {
    connected,
    address,
    connecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };
};
