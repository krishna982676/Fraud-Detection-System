import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Cpu,
  PlayCircle,
  Settings,
  Database,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../store/authStore';
import { BRAND } from '../../config/brand';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { to: '/app/operations', label: 'Operations', icon: LayoutDashboard },
  { to: '/app/transactions', label: 'Transactions', icon: Activity },
  { to: '/app/alerts', label: 'Alert Triage', icon: AlertTriangle },
  { to: '/app/model', label: 'Model Lab', icon: Cpu },
  { to: '/app/simulator', label: 'Simulator', icon: PlayCircle },
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/datasets', label: 'Dataset Intelligence', icon: Database },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'bg-surface border-r border-border flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Top Brand & Collapse Button */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded bg-cyber-green-dim border border-accent/50 flex items-center justify-center text-accent shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-mono text-sm font-bold text-text-primary tracking-wider truncate">
                {BRAND.name}<span className="text-accent">.AI</span>
              </span>
            </Link>
          )}

          {collapsed && (
            <Link to="/" className="mx-auto">
              <div className="w-7 h-7 rounded bg-cyber-green-dim border border-accent/50 flex items-center justify-center text-accent">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </Link>
          )}

          <button
            onClick={onToggle}
            className={cn(
              'p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors',
              collapsed && 'hidden'
            )}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1.5 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all',
                    isActive
                      ? 'bg-accent/12 text-accent border border-accent/50 shadow-glow-green-sm font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-transparent font-medium'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Clearance & Logout */}
      <div className="p-3 border-t border-border">
        {!collapsed && user && (
          <div className="mb-2 p-2.5 rounded-lg bg-surface-raised border border-border-strong">
            <div className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">
              // ACTIVE CLEARANCE
            </div>
            <div className="text-xs font-bold text-text-primary truncate mt-0.5">{user.username}</div>
            <div className="text-[11px] font-mono text-text-secondary mt-0.5">{user.role} // READ-WRITE</div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono text-text-secondary hover:text-semantic-high hover:bg-semantic-high/10 transition-colors',
            collapsed && 'justify-center'
          )}
          title="Disconnect Session"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Disconnect</span>}
        </button>
      </div>
    </aside>
  );
};
