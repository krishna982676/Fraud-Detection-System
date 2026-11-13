import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ items, className, allowMultiple = false }) => {
  const [openIds, setOpenIds] = useState<string[]>([items[0]?.id || '']);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="border border-border rounded-xl overflow-hidden bg-surface transition-colors hover:border-cyber-green/30"
          >
            <button
              type="button"
              id={`accordion-btn-${item.id}`}
              aria-controls={`accordion-content-${item.id}`}
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between p-5 text-left text-text-primary hover:text-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green transition-colors"
            >
              <span className="font-medium text-base pr-4">{item.question}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-text-muted transition-transform duration-200 shrink-0',
                  isOpen && 'transform rotate-180 text-cyber-green'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`accordion-content-${item.id}`}
                  role="region"
                  aria-labelledby={`accordion-btn-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border/50 pt-3">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

