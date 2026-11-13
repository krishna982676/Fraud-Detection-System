import { useState, useEffect, useCallback } from 'react';
import type { Alert, AnalysisResponse, SystemStatsDto } from '../types/api';
import { getSystemStats } from '../api/transactions';
import { getAlerts } from '../api/alerts';

export interface TerminalLog {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'CRIT' | 'DEBUG';
  message: string;
}

// Global in-memory cache shared across components
const seenTxnIds = new Set<string>();
let globalTxns: AnalysisResponse[] = [];
let globalAlerts: Alert[] = [];
let globalLogs: TerminalLog[] = [];
let globalSelectedTxn: AnalysisResponse | null = null;
let globalIsPaused = false;
let globalStats: SystemStatsDto = {
  totalTransactions: 0,
  fraudTransactions: 0,
  legitTransactions: 0,
  fraudRatePercentage: 0,
  deltaFraudRate: 0,
  activeThreshold: 0.7,
  openAlertsCount: 0,
  totalAlertsCount: 0,
  escalatedAlertsCount: 0,
  alertsLastHour: 0,
  reviewedAlertsCount: 0,
  dismissedAlertsCount: 0,
};

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((fn) => fn());
}

export function deduplicateAndAddTransaction(txn: AnalysisResponse): boolean {
  if (!txn || !txn.transactionId) return false;
  if (seenTxnIds.has(txn.transactionId)) return false;

  seenTxnIds.add(txn.transactionId);
  if (seenTxnIds.size > 2000) {
    const first = seenTxnIds.values().next().value;
    if (first) seenTxnIds.delete(first);
  }

  if (!globalIsPaused) {
    globalTxns = [txn, ...globalTxns.slice(0, 199)];
  }

  // Push to terminal log
  const logType = txn.riskLevel === 'HIGH' ? 'CRIT' : txn.riskLevel === 'MEDIUM' ? 'WARN' : 'INFO';
  const newLog: TerminalLog = {
    id: `log_${Date.now()}_${Math.random()}`,
    time: new Date().toTimeString().split(' ')[0],
    level: logType,
    message: `[${txn.riskLevel}] ${txn.transactionId} | User: ${txn.userId} | $${txn.amount.toFixed(2)} | Score: ${(txn.finalScore * 100).toFixed(0)}%`,
  };
  globalLogs = [newLog, ...globalLogs.slice(0, 199)];

  notify();
  return true;
}

export function addAlert(alert: Alert) {
  if (!alert) return;
  const existingIdx = globalAlerts.findIndex((a) => a.id === alert.id || a.transactionId === alert.transactionId);
  if (existingIdx >= 0) {
    globalAlerts[existingIdx] = alert;
  } else {
    globalAlerts = [alert, ...globalAlerts];
  }

  const log: TerminalLog = {
    id: `log_alert_${Date.now()}`,
    time: new Date().toTimeString().split(' ')[0],
    level: 'CRIT',
    message: `🚨 ALERT [${alert.status}] ${alert.transactionId} | ${alert.merchantCategory} | Risk: ${alert.riskLevel}`,
  };
  globalLogs = [log, ...globalLogs.slice(0, 199)];

  notify();
}

export function setPaused(paused: boolean) {
  globalIsPaused = paused;
  notify();
}

export function clearTransactions() {
  globalTxns = [];
  seenTxnIds.clear();
  notify();
}

export function setSelectedTransaction(txn: AnalysisResponse | null) {
  globalSelectedTxn = txn;
  notify();
}

export function updateAlertInStore(updated: Alert) {
  globalAlerts = globalAlerts.map((a) => (a.id === updated.id ? updated : a));
  notify();
}

export function useTransactionStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const stats = await getSystemStats();
      globalStats = stats;
      notify();
    } catch {
      // API might be warming up
    }
  }, []);

  const refreshAlerts = useCallback(async (status?: string) => {
    try {
      const alerts = await getAlerts(status as any);
      globalAlerts = alerts;
      notify();
    } catch {
      // API might be warming up
    }
  }, []);

  return {
    transactions: globalTxns,
    alerts: globalAlerts,
    stats: globalStats,
    logs: globalLogs,
    isPaused: globalIsPaused,
    selectedTxn: globalSelectedTxn,
    setPaused,
    clearTransactions,
    setSelectedTransaction,
    refreshStats,
    refreshAlerts,
    updateAlertInStore,
    addTransaction: deduplicateAndAddTransaction,
  };
}

