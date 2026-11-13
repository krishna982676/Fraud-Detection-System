import { getStoredSession } from '../store/authStore';

export interface DatasetProfile {
  datasetId: string;
  name: string;
  rows: number;
  columns: number;
  columnNames: string[];
  numericalColumns: string[];
  categoricalColumns: string[];
  missingValues: number;
  duplicateRecords: number;
  targetColumn?: string | null;
  mode: 'SUPERVISED' | 'ANOMALY_DETECTION';
  status: string;
  suspicious?: number;
  review?: number;
  normal?: number;
  processingMs?: number;
  results?: DatasetResult[];
}

export interface DatasetResult {
  original: Record<string, string>;
  transactionId: string;
  amount: number;
  fraudProbability: number;
  predictedFraud: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  decision: string;
  reasons: string[];
}

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const session = getStoredSession();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  const response = await fetch(`/api/v1${url}`, { ...options, headers: { ...headers, ...(options?.headers || {}) } });
  if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`);
  return response.json() as Promise<T>;
};

export async function uploadDataset(file: File): Promise<DatasetProfile> {
  const body = new FormData();
  body.append('file', file);
  return request<DatasetProfile>('/datasets/upload', { method: 'POST', body });
}

export async function analyzeDataset(id: string): Promise<DatasetProfile> {
  return request<DatasetProfile>(`/datasets/${encodeURIComponent(id)}/analyze`, { method: 'POST' });
}

export function datasetExportUrl(id: string): string {
  return `/api/v1/datasets/${encodeURIComponent(id)}/export`;
}
