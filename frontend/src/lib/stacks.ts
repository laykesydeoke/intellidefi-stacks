'use client';

import { AppConfig, UserSession, showConnect } from "@stacks/connect";

const appConfig = new AppConfig(["store_write"]);
export const userSession = new UserSession({ appConfig });

const networkEnv = process.env.NEXT_PUBLIC_NETWORK || "testnet";

export const network = networkEnv === "mainnet" ? "mainnet" : "testnet";

export function isUserSignedIn(): boolean {
  return userSession.isUserSignedIn();
}

export function isWalletConnected(): boolean {
  return userSession.isUserSignedIn();
}

export function getUserData() {
  if (isUserSignedIn()) {
    return userSession.loadUserData();
  }
  return null;
}

export function getUserAddress(): string | null {
  const userData = getUserData();
  if (!userData) return null;
  const networkKey = networkEnv === "mainnet" ? "mainnet" : "testnet";
  return userData.profile?.stxAddress?.[networkKey] || null;
}

export function getWalletAddress(): string {
  return getUserAddress() || "";
}

export function connectWallet(onFinish?: () => void) {
  showConnect({
    appDetails: {
      name: "IntelliDeFi Protocol",
      icon: "/favicon.ico",
    },
    redirectTo: "/dashboard",
    onFinish: () => {
      if (onFinish) onFinish();
      window.location.reload();
    },
    onCancel: () => {
      console.log("Wallet connection cancelled");
    },
    userSession,
  });
}

export function disconnectWallet() {
  userSession.signUserOut();
  window.location.href = "/";
}

export function signOut() {
  disconnectWallet();
}

export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatSTX(microStx: number | bigint): string {
  const stx = Number(microStx) / 1_000_000;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(stx);
}
