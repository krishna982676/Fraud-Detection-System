import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Search,
  Cpu,
  Volume2,
  VolumeX,
  Palette,
  ChevronLeft,
  ChevronRight,
  ChevronRight as BreadcrumbSeparator,
} from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { CommandPalette } from './CommandPalette';
import { BRAND } from '../../config/brand';

interface AppHeaderProps {
  onToggleAccent?: (accent: 'green' | 'teal') => void;
  accent?: 'green' | 'teal';
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleAccent, accent = 'green' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, status } = useWebSocket();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Track history depth for enabling Back/Forward
  const historyIndexRef = useRef<number>(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    // Check if browser history has entries
    setCanGoBack(window.history.length > 1);
    setCanGoForward(true);
  }, [location]);

  // Cmd/Ctrl + K shortcut
  useKeyboardShortcut('k', (e) => {
    e.preventDefault();
    setPaletteOpen((prev) => !prev);
  }, { meta: true });

  // Two-key chord navigation: "g" then "d" (dashboard), "g" then "t" (transactions), "g" then "a" (alerts)
  useEffect(() => {
    let gPressed = false;
    let timer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        gPressed = true;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      if (gPressed && !e.metaKey && !e.ctrlKey) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          navigate('/app/operations');
        } else if (key === 't') {
          e.preventDefault();
          navigate('/app/transactions');
        } else if (key === 'a') {
          e.preventDefault();
          navigate('/app/alerts');
        } else if (key === 'm') {
          e.preventDefault();
          navigate('/app/model');
        } else if (key === 's') {
          e.preventDefault();
          navigate('/app/simulator');
        }
        gPressed = false;
        if (timer) clearTimeout(timer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, [navigate]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Generate dynamic breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, idx) => {
    const url = '/' + pathParts.slice(0, idx + 1).join('/');
    let label = part.charAt(0).toUpperCase() + part.slice(1);
    if (part === 'app') label = 'Perimeter';
    if (part === 'operations' || part === 'dashboard') label = 'Operations';
    if (part === 'transactions') label = 'Transactions';
    if (part === 'alerts') label = 'Alert Triage';
    if (part === 'model') label = 'Model Lab';
    if (part === 'simulator') label = 'Simulator';
    if (part === 'settings') label = 'Settings';
    return { url, label, isLast: idx === pathParts.length - 1 };
  });

  return (
    <>
      <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none gap-4">
        {/* Left: Back/Forward buttons + Breadcrumbs + Global Search */}
        <div className="flex items-center gap-3 min-w-0">
          {/* In-app Back and Forward arrows */}
          <div className="flex items-center rounded-lg bg-surface-raised border border-border p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={!canGoBack}
              className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Navigate Back"
              aria-label="Navigate Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              disabled={!canGoForward}
              className="p-1.5 rounded hover:bg-surface text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Navigate Forward"
              aria-label="Navigate Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-text-secondary truncate">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.url}>
                {i > 0 && <BreadcrumbSeparator className="w-3.5 h-3.5 text-text-secondary/50 shrink-0" />}
                {b.isLast ? (
                  <span className="font-bold text-text-primary truncate">{b.label}</span>
                ) : (
                  <Link to={b.url} className="hover:text-accent hover:underline truncate">
                    {b.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Global Search Pill */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-surface-raised border border-border text-xs text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all font-mono shrink-0"
            aria-label="Search or jump to command palette"
          >
            <Search className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-block ml-2 px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-semibold text-text-secondary">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Status Pills, Sound, Accent Toggle, User */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Audio Alarm Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-accent/15 border-accent text-accent font-semibold'
                : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
            }`}
            title="Toggle Alert Alarm Chime"
            aria-label="Toggle Alert Alarm Chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs font-semibold">AUDIO: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* WebSocket Status Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-accent shadow-glow-green-sm animate-pulse'
                  : 'bg-semantic-high'
              }`}
            />
            <span className="text-text-secondary text-xs hidden sm:inline">
              WS: <strong className={isConnected ? 'text-accent' : 'text-semantic-high'}>{status}</strong>
            </span>
          </div>

          {/* Model Version Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-raised border border-border text-xs font-mono text-text-secondary">
            <Cpu className="w-3.5 h-3.5 text-accent-teal" />
            <span className="text-xs">RF-50 // {BRAND.version}</span>
          </div>

          {/* Theme Accent Toggle (Green / Teal) */}
          {onToggleAccent && (
            <button
              type="button"
              onClick={() => onToggleAccent(accent === 'green' ? 'teal' : 'green')}
              className="p-2 rounded-lg bg-surface-raised border border-border text-text-secondary hover:text-text-primary transition-colors"
              title={`Switch accent to ${accent === 'green' ? 'Teal' : 'Green'}`}
              aria-label="Switch accent color"
            >
              <Palette className={`w-4 h-4 ${accent === 'teal' ? 'text-accent-teal' : 'text-accent'}`} />
            </button>
          )}

          {/* User Status Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border-strong flex items-center justify-center text-accent font-mono text-xs font-bold">
              SX
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
};

export default AppHeader;
