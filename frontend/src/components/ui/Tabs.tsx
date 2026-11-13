import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center gap-1.5 p-1 bg-surface-raised border border-border rounded-lg', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-md text-xs font-mono transition-all duration-150 flex items-center gap-2 select-none',
              isActive
                ? 'bg-accent text-accent-contrast font-bold shadow-glow-green-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface font-medium'
            )}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px]',
                  isActive
                    ? 'bg-accent-contrast/20 text-accent-contrast font-bold'
                    : 'bg-surface border border-border text-text-secondary'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
