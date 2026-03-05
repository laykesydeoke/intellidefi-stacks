import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSTX(microStx: number, decimals = 6): string {
  try {
    const stx = microStx / 1_000_000;
    return stx.toFixed(decimals);
  } catch {
    return '0';
  }
}

export function parseSTX(value: string): number {
  try {
    return Math.floor(parseFloat(value) * 1_000_000);
  } catch {
    return 0;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

export function isValidStacksAddress(address: string): boolean {
  return address.length > 20 && (address.startsWith('SP') || address.startsWith('ST'));
}

export function microStxToStx(microStx: number): number {
  return microStx / 1_000_000;
}

export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1_000_000);
}
