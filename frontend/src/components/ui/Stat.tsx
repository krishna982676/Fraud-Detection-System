import React from 'react';
import { cn } from '../../lib/utils';
import { useCountUp } from '../../hooks/useCountUp';

export interface StatProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: {
    value: string;
    isPositive?: boolean;
    isNegative?: boolean;
  };
  subtitle?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  className?: string;
  valueClassName?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  delta,
  subtitle,
  className,
  valueClassName,
}) => {
  const animated = useCountUp(value, 700);
  const displayVal = decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toLocaleString();

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl p-4 flex flex-col justify-between transition-all hover:border-border-strong hover:bg-surface-raised',
        className
      )}
    >
      <div className="flex items-center justify-between text-xs text-text-secondary font-semibold font-mono uppercase tracking-wider mb-2">
        <span>{label}</span>
        {delta && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-bold',
              delta.isPositive && 'bg-semantic-low/15 text-semantic-low border border-semantic-low/30',
              delta.isNegative && 'bg-semantic-high/15 text-semantic-high border border-semantic-high/30',
              !delta.isPositive && !delta.isNegative && 'bg-surface-raised border border-border text-text-secondary'
            )}
          >
            {delta.value}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 my-1">
        <span
          className={cn(
            'text-2xl lg:text-3xl font-bold font-mono tracking-tight text-text-primary tabular-nums',
            valueClassName
          )}
        >
          {prefix}
          {displayVal}
          {suffix}
        </span>
      </div>

      {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
    </div>
  );
};
