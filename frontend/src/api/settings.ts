import { apiFetch } from './client';
import type { ApiResponse } from '../types/api';

export interface SystemSettings {
  highThreshold: number;
  medThreshold: number;
  dedupWindowMinutes: number;
  escalationLimitMinutes: number;
  highContrastMode: boolean;
  audioAlertsEnabled: boolean;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  return apiFetch<SystemSettings>('/settings');
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
  return apiFetch<ApiResponse<SystemSettings>>('/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

