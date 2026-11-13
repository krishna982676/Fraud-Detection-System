import { apiFetch } from './client';
import type { ApiResponse, ModelMetricsDto, ThresholdSweepDto } from '../types/api';

export interface ModelVersionInfo {
  version: string;
  name: string;
  description: string;
  active: boolean;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
}

export async function getModelMetrics(): Promise<ModelMetricsDto> {
  return apiFetch<ModelMetricsDto>('/model/metrics');
}

export async function getThresholdSweep(): Promise<ThresholdSweepDto[]> {
  return apiFetch<ThresholdSweepDto[]>('/model/threshold-sweep');
}

export async function getModelVersions(): Promise<ModelVersionInfo[]> {
  return apiFetch<ModelVersionInfo[]>('/model/versions');
}

export async function activateModelVersion(version: string): Promise<ApiResponse<ModelMetricsDto>> {
  return apiFetch<ApiResponse<ModelMetricsDto>>(`/model/activate/${version}`, {
    method: 'POST',
  });
}

export async function trainModel(): Promise<ApiResponse<ModelMetricsDto>> {
  return apiFetch<ApiResponse<ModelMetricsDto>>('/model/train', {
    method: 'POST',
  });
}

export async function retrainFromFeedback(): Promise<ApiResponse<ModelMetricsDto>> {
  return apiFetch<ApiResponse<ModelMetricsDto>>('/model/retrain-from-feedback', {
    method: 'POST',
  });
}
