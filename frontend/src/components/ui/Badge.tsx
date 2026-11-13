import React from 'react';
import { cn } from '../../lib/utils';
import type { RiskLevel } from '../../types/api';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'low' | 'medium' | 'high' | 'neutral' | 'teal' | 'outline';
  riskLevel?: RiskLevel;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  riskLevel,
  dot = false,
  children,
  ...props
}) => {
  let effectiveVariant = variant || 'neutral';
  if (riskLevel === 'HIGH') effectiveVariant = 'high';
  if (riskLevel === 'MEDIUM') effectiveVariant = 'medium';
  if (riskLevel === 'LOW') effectiveVariant = 'low';

  const styles = {
    low: 'bg-semantic-low/15 text-semantic-low border-semantic-low/40',
    medium: 'bg-semantic-medium/15 text-semantic-medium border-semantic-medium/40',
    high: 'bg-semantic-high/15 text-semantic-high border-semantic-high/40',
    teal: 'bg-accent-teal/15 text-accent-teal border-accent-teal/40',
    neutral: 'bg-surface-raised text-text-primary border-border-strong',
    outline: 'bg-transparent text-text-secondary border-border-strong',
  };

  const dotColors = {
    low: 'bg-semantic-low shadow-glow-green-sm',
    medium: 'bg-semantic-medium',
    high: 'bg-semantic-high',
    teal: 'bg-accent-teal shadow-glow-teal',
    neutral: 'bg-text-secondary',
    outline: 'bg-text-secondary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border select-none',
        styles[effectiveVariant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[effectiveVariant])} />
      )}
      {children}
    </span>
  );
};
