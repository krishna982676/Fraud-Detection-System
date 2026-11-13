import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  ShieldAlert,
  Check,
  X,
  RefreshCw,
  Search,
  Filter,
  Clock,
  ArrowRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useTransactionStore } from '../../store/transactionStore';
import { updateAlertStatus, recordFeedback, getAlertById } from '../../api/alerts';
import type { Alert, AlertStatus } from '../../types/api';
import { formatCurrency, getRelativeTime, cn } from '../../lib/utils';
import { BRAND } from '../../config/brand';

export const AlertsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { alertId } = useParams<{ alertId?: string }>();
  const { alerts, refreshAlerts, updateAlertInStore } = useTransactionStore();

  const statusTab = (searchParams.get('status') as AlertStatus | 'ALL') || 'OPEN';
  const severityFilter = searchParams.get('severity') || 'ALL';
  const querySearch = searchParams.get('search') || '';

  const [searchInputValue, setSearchInputValue] = useState(querySearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAlertForShortcuts, setSelectedAlertForShortcuts] = useState<Alert | null>(null);

  // Detail Modal data (from cache or fetched via alertId)
  const [modalAlert, setModalAlert] = useState<Alert | null>(null);

  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInputValue(querySearch);
  }, [querySearch]);

  // Handle route param :alertId (direct deep links or back/forward)
  useEffect(() => {
    if (alertId) {
      const found = alerts.find((a) => String(a.id) === alertId);
      if (found) {
        setModalAlert(found);
      } else {
        getAlertById(alertId)
          .then((data) => setModalAlert(data))
          .catch(() => setModalAlert(null));
      }
    } else {
      setModalAlert(null);
    }
  }, [alertId, alerts]);

  const updateParams = (updates: Record<string, string | null>, usePush = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || (key === 'status' && val === 'OPEN') || (key === 'severity' && val === 'ALL')) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next, { replace: !usePush });
  };

  const handleSearchChange = (val: string) => {
    setSearchInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: val.trim() || null }, false);
    }, 300);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAlerts();
    setIsRefreshing(false);
    toast.success('Alert triage feed refreshed.');
  };

  const handleAction = async (alert: Alert, newStatus: 'REVIEWED' | 'DISMISSED') => {
    const prev = alert.status;
    const isFraud = newStatus === 'REVIEWED';

    try {
      const updated = await updateAlertStatus(alert.id, newStatus);
      updateAlertInStore(updated);
      if (modalAlert?.id === alert.id) {
        setModalAlert(updated);
      }
      recordFeedback(alert.id, isFraud, `Analyst marked as ${newStatus}`).catch(() => {});

      toast.success(`Alert #${alert.id} marked as ${newStatus}`, {
        description: 'Feedback recorded for continuous model retraining.',
        action: {
          label: 'Undo (5s)',
          onClick: async () => {
            const reverted = await updateAlertStatus(alert.id, prev);
            updateAlertInStore(reverted);
            if (modalAlert?.id === alert.id) setModalAlert(reverted);
            toast.info(`Alert #${alert.id} reverted to ${prev}.`);
          },
        },
        duration: 5000,
      });
    } catch {
      toast.error('Failed to update alert status.');
    }
  };

  // Keyboard shortcuts "R" (review) and "D" (dismiss)
  useEffect(() => {
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

      const activeAlert = modalAlert || selectedAlertForShortcuts;
      if (!activeAlert) return;

      if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleAction(activeAlert, 'REVIEWED');
      } else if (e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleAction(activeAlert, 'DISMISSED');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalAlert, selectedAlertForShortcuts]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (statusTab !== 'ALL' && a.status !== statusTab) return false;
      if (severityFilter !== 'ALL' && a.riskLevel !== severityFilter) return false;
      if (querySearch.trim()) {
        const q = querySearch.toLowerCase();
        const matchId = String(a.id).includes(q);
        const matchTxn = a.transactionId?.toLowerCase().includes(q);
        const matchUser = a.userId?.toLowerCase().includes(q);
        if (!matchId && !matchTxn && !matchUser) return false;
      }
      return true;
    });
  }, [alerts, statusTab, severityFilter, querySearch]);

  const openDetailRoute = (a: Alert) => {
    setSelectedAlertForShortcuts(a);
    navigate(`/app/alerts/${a.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  };

  const closeDetailRoute = () => {
    setModalAlert(null);
    navigate(`/app/alerts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  };

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Security Alert Triage</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary font-mono flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-semantic-high" />
              Security Alert Triage Feed
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Consolidated suspicious events. Use keyboard shortcuts <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-[11px] font-bold">R</kbd> (Review) and <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-[11px] font-bold">D</kbd> (Dismiss).
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh} isLoading={isRefreshing}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh Queue
          </Button>
        </div>

        {/* Toolbar: Status Tabs + Search + Severity */}
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex border-b border-border text-xs font-mono gap-2 pb-2 overflow-x-auto">
            {(['OPEN', 'ESCALATED', 'REVIEWED', 'DISMISSED', 'ALL'] as const).map((tab) => {
              const count = tab === 'ALL' ? alerts.length : alerts.filter((a) => a.status === tab).length;
              const isActive = statusTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => updateParams({ status: tab === 'OPEN' ? null : tab }, true)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-bold select-none cursor-pointer',
                    isActive
                      ? 'bg-accent text-accent-contrast shadow-glow-green-sm'
                      : 'bg-surface text-text-secondary hover:text-text-primary border border-border-strong font-medium'
                  )}
                >
                  <span>{tab}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded text-[10px] tabular-nums font-bold',
                      isActive ? 'bg-accent-contrast/20 text-accent-contrast' : 'bg-surface-raised text-text-secondary'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Severity Filter Bar */}
          <div className="bg-surface border border-border rounded-xl p-3 flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
              <input
                value={searchInputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search alerts by ID, transaction, or user..."
                className="w-full bg-surface-raised border border-border rounded-lg pl-9 pr-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent hover:border-border-strong text-xs font-mono"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => updateParams({ severity: e.target.value }, true)}
              className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none cursor-pointer hover:border-border-strong text-xs font-mono"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">HIGH Risk Only</option>
              <option value="MEDIUM">MEDIUM Risk Only</option>
              <option value="LOW">LOW Risk Only</option>
            </select>

            <span className="text-text-secondary text-xs font-semibold ml-auto">
              Showing {filtered.length} of {alerts.length} alerts
            </span>
          </div>
        </div>

        {/* Alert Cards Feed */}
        {filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center text-text-secondary font-mono text-xs">
            No alerts found matching current filter parameters.
          </div>
        ) : (
          <div className="space-y-3 font-mono">
            {filtered.map((alert) => {
              const isSelected = selectedAlertForShortcuts?.id === alert.id || modalAlert?.id === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => openDetailRoute(alert)}
                  className={cn(
                    'bg-surface border rounded-xl p-4 transition-all cursor-pointer hover:border-accent/60 shadow-lg',
                    isSelected ? 'border-accent ring-1 ring-accent/40 bg-accent/5' : 'border-border',
                    alert.status === 'ESCALATED' && 'border-semantic-high/40 bg-semantic-high/5'
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <Badge riskLevel={alert.riskLevel}>{alert.riskLevel}</Badge>
                      <span className="font-bold text-text-primary text-sm">
                        Alert #{alert.id} // {alert.transactionId}
                      </span>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded border',
                        alert.status === 'OPEN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        alert.status === 'ESCALATED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        alert.status === 'REVIEWED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                      )}>
                        {alert.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {getRelativeTime(alert.createdAt)}
                      </span>
                      <span className="font-bold text-text-primary">
                        Score: {Math.round((alert.fraudProbability ?? 0.8) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3 text-text-secondary">
                    <div>
                      <span className="block text-[11px] uppercase">User:</span>
                      <strong className="text-text-primary">{alert.userId}</strong>
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase">Amount:</span>
                      <strong className="text-text-primary">{formatCurrency(alert.amount)}</strong>
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase">Category:</span>
                      <strong className="text-text-primary">{alert.merchantCategory}</strong>
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase">Merged Events:</span>
                      <strong className="text-accent">{alert.mergedCount || 1} txn(s)</strong>
                    </div>
                  </div>

                  {/* Reasons summary */}
                  {alert.reasons && (
                    <div className="text-xs text-text-secondary bg-surface-raised p-2 rounded border border-border/60 mb-3 truncate">
                      {alert.reasons}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <span className="text-[11px] text-text-secondary">
                      Click card for deep inspection or use R / D keys
                    </span>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {alert.status !== 'REVIEWED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(alert, 'REVIEWED')}
                          className="text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10 text-xs py-1 px-2.5 h-auto"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Mark Reviewed (R)
                        </Button>
                      )}
                      {alert.status !== 'DISMISSED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction(alert, 'DISMISSED')}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs py-1 px-2.5 h-auto"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Dismiss (D)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deep Link Route Detail Modal */}
      {modalAlert && (
        <Modal isOpen={Boolean(modalAlert)} onClose={closeDetailRoute} maxWidth="max-w-2xl">
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Badge riskLevel={modalAlert.riskLevel}>{modalAlert.riskLevel}</Badge>
                <h3 className="font-bold text-text-primary text-base">
                  Alert #{modalAlert.id} Detail
                </h3>
              </div>
              <span className="text-xs text-text-secondary">
                {getRelativeTime(modalAlert.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-surface-raised p-4 rounded-xl border border-border">
              <div>
                <span className="text-text-secondary block">Transaction ID:</span>
                <strong className="text-accent">{modalAlert.transactionId}</strong>
              </div>
              <div>
                <span className="text-text-secondary block">User ID:</span>
                <strong className="text-text-primary">{modalAlert.userId}</strong>
              </div>
              <div>
                <span className="text-text-secondary block">Amount:</span>
                <strong className="text-text-primary font-bold">{formatCurrency(modalAlert.amount)}</strong>
              </div>
              <div>
                <span className="text-text-secondary block">Category:</span>
                <strong className="text-text-primary">{modalAlert.merchantCategory}</strong>
              </div>
              <div>
                <span className="text-text-secondary block">Current Status:</span>
                <strong className="text-accent">{modalAlert.status}</strong>
              </div>
              <div>
                <span className="text-text-secondary block">Risk Probability:</span>
                <strong className="text-semantic-high">{Math.round((modalAlert.fraudProbability ?? 0.8) * 100)}%</strong>
              </div>
            </div>

            <div className="bg-surface-raised p-4 rounded-xl border border-border">
              <h4 className="font-bold text-text-primary uppercase text-xs mb-2">Detection Violations &amp; Telemetry</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {modalAlert.reasons || 'No structured reason payload stored.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="ghost" size="sm" onClick={closeDetailRoute}>
                Close (ESC)
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(modalAlert, 'REVIEWED')}
                  className="text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Mark Reviewed (R)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(modalAlert, 'DISMISSED')}
                  className="text-rose-400 border-rose-500/40 hover:bg-rose-500/10"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Dismiss (D)
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AlertsPage;
