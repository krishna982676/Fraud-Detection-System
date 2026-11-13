import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { MegaMenu } from './MegaMenu';
import { MEGA_MENU_DATA, type MegaMenuSection } from '../../content/megaMenu';
import { BRAND } from '../../config/brand';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<MegaMenuSection | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menus on route change or Esc key
  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="fixed top-5 inset-x-0 z-40 flex justify-center px-4">
      {/* Floating Pill Bar */}
      <nav
        aria-label="Main Navigation"
        className="w-full max-w-6xl h-16 bg-surface/90 backdrop-blur-xl border border-border rounded-full px-5 flex items-center justify-between shadow-2xl transition-all hover:border-border-strong"
      >
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-accent rounded-full px-2"
        >
          <div className="w-8 h-8 rounded-lg bg-cyber-green-dim border border-accent/50 flex items-center justify-center text-accent shadow-glow-green-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold font-mono tracking-wider text-base text-text-primary">
            {BRAND.name}
            <span className="text-accent">.AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links with Animated Underline & Mega Menu */}
        <div className="hidden lg:flex items-center gap-1 relative">
          {MEGA_MENU_DATA.map((section) => {
            const isOpen = activeMenu?.id === section.id;
            return (
              <div
                key={section.id}
                className="relative"
                onMouseEnter={() => setActiveMenu(section)}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setActiveMenu(isOpen ? null : section)}
                  className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-text-secondary hover:text-accent transition-colors flex items-center gap-1 rounded-full focus:outline-none focus:ring-2 focus:ring-accent font-medium"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent' : 'text-text-secondary'
                    }`}
                  />
                </button>
              </div>
            );
          })}

          <Link
            to="/technology"
            className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-text-secondary hover:text-accent transition-colors rounded-full font-medium"
          >
            Architecture
          </Link>

          {/* Centered Mega Menu Panel */}
          <MegaMenu activeSection={activeMenu} onClose={() => setActiveMenu(null)} />
        </div>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Terminal Login
            </Button>
          </Link>
          <Link to="/demo">
            <Button variant="primary" size="sm">
              Request Demo
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          aria-label="Toggle Navigation Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary focus:outline-none"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Slide-Over Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-24 bg-surface/95 backdrop-blur-2xl border border-border rounded-2xl p-6 shadow-2xl z-50 flex flex-col gap-4 lg:hidden"
          >
            <div className="space-y-2 border-b border-border pb-4">
              <Link
                to="/technology"
                className="block py-2 text-sm font-mono text-text-secondary hover:text-accent font-medium"
              >
                Architecture &amp; Algorithms
              </Link>
              <Link
                to="/demo"
                className="block py-2 text-sm font-mono text-text-secondary hover:text-accent font-medium"
              >
                Schedule Technical Demo
              </Link>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" className="w-full">
                <Button variant="outline" size="md" className="w-full">
                  Terminal Login
                </Button>
              </Link>
              <Link to="/demo" className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  Request Access
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
