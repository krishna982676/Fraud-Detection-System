import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverEffect = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl p-5 text-text-primary',
        hoverEffect && 'transition-all duration-200 hover:border-border-strong hover:bg-surface-raised',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
