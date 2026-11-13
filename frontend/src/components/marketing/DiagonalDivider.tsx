import React from 'react';
import { cn } from '../../lib/utils';

export interface DiagonalDividerProps {
  className?: string;
  reverse?: boolean;
}

export const DiagonalDivider: React.FC<DiagonalDividerProps> = ({ className, reverse = false }) => {
  return (
    <div className={cn('relative w-full h-16 overflow-hidden my-8 select-none', className)}>
      <div
        className={cn(
          'absolute top-1/2 left-[-5%] w-[110%] h-[2px] bg-gradient-to-r from-transparent via-cyber-green via-cyber-teal to-transparent shadow-[0_0_12px_rgba(0,255,156,0.5)] transform -translate-y-1/2',
          reverse ? 'rotate-[1.4deg]' : '-rotate-[1.4deg]'
        )}
      />
    </div>
  );
};

