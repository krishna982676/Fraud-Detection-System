import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MegaMenuSection } from '../../content/megaMenu';

interface MegaMenuProps {
  activeSection: MegaMenuSection | null;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ activeSection, onClose }) => {
  if (!activeSection) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onMouseLeave={onClose}
        role="region"
        aria-label={`${activeSection.label} menu`}
        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[720px] max-w-[92vw] bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 z-50 text-left"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Intro Card */}
          <div className="bg-surface-raised border border-border/80 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-cyber-green uppercase tracking-wider mb-2">
                // {activeSection.label}
              </div>
              <h4 className="text-base font-bold text-text-primary mb-2">
                {activeSection.introTitle || activeSection.label}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {activeSection.introDesc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/40">
              <Link
                to="/technology"
                onClick={onClose}
                className="text-xs font-mono text-cyber-teal hover:underline flex items-center gap-1"
              >
                Explore Architecture &rarr;
              </Link>
            </div>
          </div>

          {/* Right 2-Column Items Grid */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSection.items.map((item) => {
              // Dynamic icon resolver
              const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
                item.iconName
              ] || Icons.Shield;

              return (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={onClose}
                  className="group p-3 rounded-xl border border-transparent hover:border-border hover:bg-surface-elevated transition-all flex flex-col gap-1.5 focus:outline-none focus:ring-1 focus:ring-cyber-green"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-surface-raised text-cyber-green group-hover:text-cyber-teal group-hover:bg-surface transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-text-primary group-hover:text-cyber-green transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-snug pl-8">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

