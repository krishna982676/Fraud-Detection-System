import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, children, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-mono text-text-secondary uppercase tracking-wider font-semibold">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-surface-raised border border-border rounded-lg text-sm text-text-primary px-3 py-2 transition-all focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 cursor-pointer hover:border-border-strong',
            error && 'border-semantic-high focus:border-semantic-high',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface text-text-primary">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-xs text-semantic-high font-mono">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
