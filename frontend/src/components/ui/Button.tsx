import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'cyber' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:shadow-none';

    const variants = {
      primary:
        'bg-accent text-accent-contrast font-semibold shadow-glow-green-sm hover:bg-accent-hover hover:shadow-glow-green',
      secondary:
        'bg-transparent border border-border-strong text-text-primary font-medium hover:bg-surface-raised hover:border-accent/60',
      outline:
        'bg-transparent border border-border-strong text-text-primary font-medium hover:bg-surface-raised hover:border-accent/60',
      cyber:
        'bg-accent-dim border border-accent text-accent font-semibold hover:bg-accent/20 hover:shadow-glow-green-sm',
      ghost:
        'bg-transparent text-text-secondary font-medium hover:text-text-primary hover:bg-surface-raised',
      danger:
        'bg-semantic-high/15 border border-semantic-high/40 text-semantic-high font-semibold hover:bg-semantic-high/25',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-3 gap-2.5 h-12',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
