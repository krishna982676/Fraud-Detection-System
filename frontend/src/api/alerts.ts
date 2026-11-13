import { apiFetch } from './client';
import type { Alert, AlertStatus, ApiResponse } from '../types/api';

export async function getAlerts(status?: AlertStatus | ''): Promise<Alert[]> {
  const query = status ? `?status=${status}` : '';
  return apiFetch<Alert[]>(`/alerts${query}`);
}

export async function getAlertById(alertId: string | number): Promise<Alert> {
  return apiFetch<Alert>(`/alerts/${alertId}`);
}

export async function updateAlertStatus(id: number, status: AlertStatus): Promise<Alert> {
  return apiFetch<Alert>(`/alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function recordFeedback(alertId: number, isFraud: boolean, notes = ''): Promise<ApiResponse<string>> {
  return apiFetch<ApiResponse<string>>('/alerts/feedback', {
    method: 'POST',
    body: JSON.stringify({
      alertId,
      isFraud,
      analystNotes: notes,
    }),
  });
}
