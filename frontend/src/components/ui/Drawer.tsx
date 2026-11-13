import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className,
  width = 'max-w-xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-base/80 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={cn(
              'fixed top-0 right-0 bottom-0 w-full bg-surface border-l border-border z-50 flex flex-col shadow-2xl overflow-hidden',
              width,
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-raised">
              <div>
                <div className="font-semibold text-text-primary text-base flex items-center gap-2">
                  {title}
                </div>
                {subtitle && <div className="text-xs text-text-muted mt-0.5">{subtitle}</div>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

