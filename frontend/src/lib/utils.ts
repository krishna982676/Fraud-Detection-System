import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

export function getRelativeTime(timestamp: string | undefined): string {
  if (!timestamp) return 'just now';
  const d = new Date(timestamp);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function getRiskColor(level: 'LOW' | 'MEDIUM' | 'HIGH' | string) {
  switch (level?.toUpperCase()) {
    case 'HIGH':
      return {
        text: 'text-semantic-high',
        bg: 'bg-semantic-high/10',
        border: 'border-semantic-high/30',
        hex: '#FF3B5C',
      };
    case 'MEDIUM':
      return {
        text: 'text-semantic-medium',
        bg: 'bg-semantic-medium/10',
        border: 'border-semantic-medium/30',
        hex: '#FFB020',
      };
    case 'LOW':
    default:
      return {
        text: 'text-cyber-green',
        bg: 'bg-cyber-green/10',
        border: 'border-cyber-green/30',
        hex: '#00FF9C',
      };
  }
}

