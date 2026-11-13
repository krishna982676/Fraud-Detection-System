import { apiFetch } from './client';
import type {
  AnalysisResponse,
  SystemStatsDto,
  TransactionRequest,
  UserDetailResponse,
} from '../types/api';

export async function analyzeTransaction(req: TransactionRequest): Promise<AnalysisResponse> {
  const start = performance.now();
  // Ensure timestamp is in strict ISO format without Z if backend uses local format
  const payload = {
    ...req,
    timestamp: req.timestamp || new Date().toISOString().split('.')[0],
  };
  const res = await apiFetch<AnalysisResponse>('/transactions/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const latencyMs = Math.round(performance.now() - start);
  const finalScore = res.finalScore !== undefined ? res.finalScore : (res.scoreBreakdown?.finalScore ?? res.fraudProbability);
  const ruleScore = res.ruleScore !== undefined ? res.ruleScore : (res.scoreBreakdown?.ruleScore ?? 0);
  const mlScore = res.mlScore !== undefined ? res.mlScore : (res.scoreBreakdown?.mlScore ?? res.fraudProbability);
  const decision = res.decision || (res.isFraud || res.riskLevel === 'HIGH' ? 'BLOCK' : res.riskLevel === 'MEDIUM' ? 'REVIEW' : 'APPROVE');

  return {
    ...res,
    latencyMs,
    finalScore,
    ruleScore,
    mlScore,
    decision,
  };
}

export async function getRecentTransactions(page = 0, size = 50): Promise<{ content: AnalysisResponse[]; totalElements?: number; totalPages?: number }> {
  return apiFetch<{ content: AnalysisResponse[]; totalElements?: number; totalPages?: number }>(`/transactions?page=${page}&size=${size}`);
}

export async function getTransactionById(txnId: string): Promise<AnalysisResponse> {
  return apiFetch<AnalysisResponse>(`/transactions/${encodeURIComponent(txnId)}`);
}

export async function getUserDetail(userId: string): Promise<UserDetailResponse> {
  return apiFetch<UserDetailResponse>(`/transactions/user/${encodeURIComponent(userId)}`);
}

export async function getSystemStats(): Promise<SystemStatsDto> {
  return apiFetch<SystemStatsDto>('/stats');
}
