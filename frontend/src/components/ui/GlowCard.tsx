import React from 'react';
import { cn } from '../../lib/utils';

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: 'green' | 'teal';
}

export const GlowCard: React.FC<GlowCardProps> = ({ className, glowColor = 'green', children, ...props }) => {
  return (
    <div
      className={cn(
        'glow-card p-6 relative overflow-hidden group',
        glowColor === 'teal' && 'before:bg-gradient-to-br before:from-cyber-teal/30 before:to-transparent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

