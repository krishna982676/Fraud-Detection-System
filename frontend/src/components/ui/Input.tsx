import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-mono text-text-secondary uppercase tracking-wider font-semibold">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-text-secondary pointer-events-none">{icon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-surface-raised border border-border rounded-lg text-sm text-text-primary px-3 py-2 transition-all placeholder:text-text-muted hover:border-border-strong focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
              icon && 'pl-9',
              error && 'border-semantic-high focus:border-semantic-high focus:ring-semantic-high/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-semantic-high font-mono">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
