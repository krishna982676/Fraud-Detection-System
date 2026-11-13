import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ShieldAlert,
  Activity,
  Play,
  Pause,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/Badge';
import { ThreatGauge } from '../../components/ui/Gauge';
import { Sparkline } from '../../components/ui/Sparkline';
import { CityHeatMap } from '../../components/app/CityHeatMap';
import { LiveLogTerminal } from '../../components/app/LiveLogTerminal';
import { useTransactionStore } from '../../store/transactionStore';
import { updateAlertStatus, recordFeedback } from '../../api/alerts';
import type { Alert } from '../../types/api';
import { formatCurrency, getRelativeTime, cn } from '../../lib/utils';
import { BRAND } from '../../config/brand';

export const DashboardPage: React.FC = () => {
  const {
    transactions,
    alerts,
    stats,
    isPaused,
    setPaused,
    clearTransactions,
    setSelectedTransaction,
    refreshStats,
    refreshAlerts,
    updateAlertInStore,
  } = useTransactionStore();

  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAlertStatus, setSelectedAlertStatus] = useState<'OPEN' | 'REVIEWED' | 'DISMISSED' | 'ALL'>('OPEN');

  // Sync stats and alerts on mount and every 5 seconds
  useEffect(() => {
    refreshStats();
    refreshAlerts();
    const interval = setInterval(() => {
      refreshStats();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshStats, refreshAlerts]);

  // Handle Review / Dismiss with 5-second undo toast
  const handleAlertAction = async (alert: Alert, newStatus: 'REVIEWED' | 'DISMISSED') => {
    const prev = alert.status;
    const isFraudLabel = newStatus === 'REVIEWED';

    try {
      const updated = await updateAlertStatus(alert.id, newStatus);
      updateAlertInStore(updated);

      // Record feedback label for continuous model training
      recordFeedback(alert.id, isFraudLabel, `Analyst marked as ${newStatus}`).catch(() => {});

      toast.success(
        `Alert ${alert.transactionId} marked ${newStatus}`,
        {
          description: 'Label submitted to continuous retraining buffer.',
          action: {
            label: 'Undo (5s)',
            onClick: async () => {
              const reverted = await updateAlertStatus(alert.id, prev);
              updateAlertInStore(reverted);
              toast.info(`Alert ${alert.transactionId} status reverted to ${prev}.`);
            },
          },
          duration: 5000,
        }
      );
    } catch {
      toast.error('Failed to update alert state.');
    }
  };

  // Keyboard shortcut listener for R (Review) and D (Dismiss) on first open alert
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      const openAlerts = alerts.filter((a) => a.status === 'OPEN' || a.status === 'ESCALATED');
      if (openAlerts.length === 0) return;
      const topAlert = openAlerts[0];

      if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleAlertAction(topAlert, 'REVIEWED');
      } else if (e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleAlertAction(topAlert, 'DISMISSED');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alerts]);

  // Filtered transactions for feed
  const filteredTransactions = transactions.filter((t) => {
    if (filterRisk !== 'ALL' && t.riskLevel !== filterRisk) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.transactionId.toLowerCase().includes(q) ||
        t.userId.toLowerCase().includes(q) ||
        t.merchantCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered alerts
  const filteredAlerts = alerts.filter((a) => {
    if (selectedAlertStatus === 'ALL') return true;
    return a.status === selectedAlertStatus;
  });

  // Calculate Threat Level (0..1) based on open high alerts and fraud rate
  const openHighAlerts = alerts.filter((a) => a.status === 'OPEN' && a.riskLevel === 'HIGH').length;
  const threatScore = Math.min(1.0, (openHighAlerts * 0.15) + (stats.fraudRatePercentage / 20));

  // Sparkline arrays
  const sparklineTxns = [12, 14, 18, 16, 22, 28, 25, 30, 35, 32, 38, 42];
  const sparklineFraud = [0, 1, 0, 2, 1, 3, 2, 4, 3, 5, 4, openHighAlerts];

  return (
    <>
      <Helmet>
        <title>{BRAND.name} // Security Operations Center</title>
      </Helmet>

      {/* TOP ROW: STATS & THREAT LEVEL GAUGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Threat Level Semicircle Meter */}
        <div className="lg:col-span-1">
          <ThreatGauge
            score={threatScore}
            sublabel={`${openHighAlerts} Unresolved HIGH alerts`}
          />
        </div>

        {/* 4 Stat Cards with Sparklines */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between hover:border-border-strong transition-all">
            <div>
              <div className="flex justify-between items-center text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-1">
                <span>INGESTION VOLUME</span>
                <span className="text-accent font-bold">+5.4% /m</span>
              </div>
              <div className="text-2xl font-bold font-mono text-text-primary tabular-nums">
                {stats.totalTransactions.toLocaleString()}
              </div>
              <span className="text-xs text-text-secondary font-mono block mt-1">Single source /api/stats</span>
            </div>
            <div className="mt-3">
              <Sparkline data={sparklineTxns} color="#00FF9C" width={180} height={28} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between hover:border-border-strong transition-all">
            <div>
              <div className="flex justify-between items-center text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-1">
                <span>FRAUD INCIDENCE</span>
                <span className="text-semantic-medium font-bold">{stats.fraudRatePercentage.toFixed(2)}%</span>
              </div>
              <div className="text-2xl font-bold font-mono text-semantic-medium tabular-nums">
                {stats.fraudTransactions.toLocaleString()}
              </div>
              <span className="text-xs text-text-secondary font-mono block mt-1">
                {stats.legitTransactions.toLocaleString()} validated legit
              </span>
            </div>
            <div className="mt-3">
              <Sparkline data={sparklineFraud} color="#FFB020" width={180} height={28} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between hover:border-border-strong transition-all">
            <div>
              <div className="flex justify-between items-center text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-1">
                <span>OPEN ALERTS</span>
                <span className="text-semantic-high font-bold">{stats.escalatedAlertsCount} ESC</span>
              </div>
              <div className="text-2xl font-bold font-mono text-semantic-high tabular-nums">
                {stats.openAlertsCount}
              </div>
              <span className="text-xs text-text-secondary font-mono block mt-1">Auto-merged in 5m window</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-text-secondary">
              <span>Rolling 60m:</span>
              <span className="text-text-primary font-bold">{stats.alertsLastHour} alerts</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between hover:border-border-strong transition-all">
            <div>
              <div className="flex justify-between items-center text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-1">
                <span>DECISION CUTOFF</span>
                <span className="text-accent-teal font-bold">ACTIVE</span>
              </div>
              <div className="text-2xl font-bold font-mono text-accent-teal tabular-nums">
                {Math.round((stats.activeThreshold || 0.7) * 100)}%
              </div>
              <span className="text-xs text-text-secondary font-mono block mt-1">
                {stats.reviewedAlertsCount} reviewed / {stats.dismissedAlertsCount} dismissed
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-border flex justify-between text-xs font-mono text-text-secondary">
              <span>Model Confidence:</span>
              <span className="text-accent font-bold">99.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: LIVE INGESTION TABLE (LEFT) + ALERTS TRIAGE FEED (RIGHT - 380px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Live Transaction Ingestion Feed */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header & Controls Toolbar */}
          <div className="p-4 border-b border-border bg-surface-raised flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider">
                Live Transaction Stream
              </span>
              <span className="text-xs font-mono bg-surface px-2.5 py-0.5 rounded text-text-secondary border border-border font-semibold">
                {filteredTransactions.length} buffered
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaused(!isPaused)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors',
                  isPaused
                    ? 'bg-semantic-medium/15 text-semantic-medium border-semantic-medium/40 font-semibold'
                    : 'bg-surface border-border-strong text-text-secondary hover:text-text-primary hover:border-accent/50'
                )}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                type="button"
                onClick={clearTransactions}
                className="p-1.5 rounded-lg bg-surface border border-border-strong text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors"
                title="Clear table feed"
                aria-label="Clear table feed"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filtering Bar */}
          <div className="p-3 border-b border-border bg-surface flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search User ID, Txn ID, Category..."
              className="flex-1 min-w-[180px] bg-surface-raised border border-border rounded-lg text-xs px-3 py-1.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent font-mono hover:border-border-strong"
            />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-surface-raised border border-border rounded-lg text-xs px-3 py-1.5 text-text-primary focus:outline-none font-mono cursor-pointer hover:border-border-strong"
            >
              <option value="ALL" className="bg-surface text-text-primary">All Risk Tiers</option>
              <option value="HIGH" className="bg-surface text-text-primary">High Risk Only</option>
              <option value="MEDIUM" className="bg-surface text-text-primary">Medium Risk</option>
              <option value="LOW" className="bg-surface text-text-primary">Low Risk</option>
            </select>
          </div>

          {/* Scrollable Table Container */}
          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="sticky top-0 bg-surface-raised/95 backdrop-blur border-b border-border text-text-secondary text-xs uppercase z-10 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Txn ID</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Violations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-text-secondary text-xs">
                      Awaiting live transactions... Start the simulator or send requests to /api/v1/transactions/analyze.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const probPct = Math.round(t.fraudProbability * 100);
                    return (
                      <tr
                        key={t.transactionId}
                        onClick={() => setSelectedTransaction(t)}
                        className={cn(
                          'hover:bg-surface-raised transition-colors cursor-pointer group',
                          t.riskLevel === 'HIGH' && 'bg-semantic-high/5 hover:bg-semantic-high/10'
                        )}
                      >
                        <td className="py-2.5 px-3 text-text-secondary text-xs whitespace-nowrap">
                          {getRelativeTime(t.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 text-accent font-bold group-hover:underline">
                          {t.transactionId}
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary">{t.userId}</td>
                        <td className="py-2.5 px-3 text-text-primary font-bold whitespace-nowrap">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary text-xs uppercase">
                          {t.merchantCategory}
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary">{t.location}</td>
                        <td className="py-2.5 px-3">
                          <Badge riskLevel={t.riskLevel} className="text-xs px-2 py-0.5">
                            {t.riskLevel}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                t.riskLevel === 'HIGH'
                                  ? 'text-semantic-high'
                                  : t.riskLevel === 'MEDIUM'
                                  ? 'text-semantic-medium'
                                  : 'text-accent'
                              }`}
                            >
                              {probPct}%
                            </span>
                            <div className="w-12 h-1.5 bg-surface-raised rounded-full overflow-hidden border border-border">
                              <div
                                className={cn(
                                  'h-full',
                                  t.riskLevel === 'HIGH'
                                    ? 'bg-semantic-high'
                                    : t.riskLevel === 'MEDIUM'
                                    ? 'bg-semantic-medium'
                                    : 'bg-accent'
                                )}
                                style={{ width: `${probPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {t.structuredReasons && t.structuredReasons.length > 0 ? (
                            <span
                              className="px-1.5 py-0.5 rounded text-xs bg-semantic-high/15 text-semantic-high border border-semantic-high/40 font-bold"
                              title={t.structuredReasons.map((r) => r.message).join(' | ')}
                            >
                              {t.structuredReasons[0].code}
                              {t.structuredReasons.length > 1 && ` +${t.structuredReasons.length - 1}`}
                            </span>
                          ) : (
                            <span className="text-text-secondary text-xs">Nominal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols / 380px fixed aesthetic): Alerts Feed */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border bg-surface-raised flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-semantic-high" />
              <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider">
                Security Alerts Feed
              </span>
              <span className="text-xs font-mono bg-semantic-high/15 text-semantic-high px-2 py-0.5 rounded border border-semantic-high/40 font-semibold">
                {alerts.filter((a) => a.status === 'OPEN').length} OPEN
              </span>
            </div>
            <div className="text-xs font-mono text-text-secondary">
              Shortcuts: [R] Review, [D] Dismiss
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex border-b border-border bg-surface text-xs font-mono p-1 gap-1">
            {(['OPEN', 'REVIEWED', 'DISMISSED', 'ALL'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedAlertStatus(status)}
                className={cn(
                  'flex-1 py-1 text-center rounded text-xs transition-colors font-medium',
                  selectedAlertStatus === status
                    ? 'bg-surface-raised text-accent font-bold border border-border-strong'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Alert Cards List */}
          <div className="p-3 max-h-[520px] overflow-y-auto space-y-2.5 font-mono text-xs">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-text-secondary text-xs">
                All clear. No open alerts matching view &check;
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-surface-raised border border-border flex flex-col gap-2 hover:border-border-strong transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-bold">{alert.transactionId}</span>
                    <Badge riskLevel={alert.riskLevel} className="text-xs px-2 py-0.5">
                      {alert.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between text-text-secondary text-xs">
                    <span>User: {alert.userId}</span>
                    <span className="text-text-primary font-bold">{formatCurrency(alert.amount)}</span>
                  </div>

                  <div className="text-xs text-text-secondary flex justify-between items-center">
                    <span>{alert.merchantCategory} • {alert.location}</span>
                    <span>{getRelativeTime(alert.createdAt)}</span>
                  </div>

                  {alert.eventCount > 1 && (
                    <div className="text-xs text-accent-teal bg-accent-teal/15 px-2 py-0.5 rounded border border-accent-teal/40 font-semibold">
                      Merged {alert.eventCount} repeated attempts in 5m
                    </div>
                  )}

                  {/* Actions (Review / Dismiss) for Open Alerts */}
                  {alert.status === 'OPEN' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => handleAlertAction(alert, 'REVIEWED')}
                        className="flex-1 py-1.5 rounded bg-semantic-high/15 text-semantic-high border border-semantic-high/40 hover:bg-semantic-high/25 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        True Fraud [R]
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAlertAction(alert, 'DISMISSED')}
                        className="flex-1 py-1.5 rounded bg-surface border border-border-strong text-text-secondary hover:text-text-primary hover:border-accent/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Dismiss [D]
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: GEOGRAPHIC HEATMAP + LIVE LOG TERMINAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <CityHeatMap />
        </div>
        <div className="lg:col-span-6">
          <LiveLogTerminal />
        </div>
      </div>
    </>
  );
};
