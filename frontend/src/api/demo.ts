import { apiFetch } from './client';
import type { ApiResponse, DemoRequestPayload } from '../types/api';

export async function submitDemoRequest(payload: DemoRequestPayload): Promise<ApiResponse<unknown>> {
  return apiFetch<ApiResponse<unknown>>('/demo-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

