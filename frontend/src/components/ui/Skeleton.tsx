import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, style, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-raised border border-border/40', className)}
      style={style}
      {...props}
    />
  );
};

