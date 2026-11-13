import { getStoredSession } from '../store/authStore';

const BASE_API = '/api/v1';
const FALLBACK_API = '/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const session = getStoredSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (session?.token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  try {
    let response = await fetch(url, { ...options, headers });
    // If /api/v1 returns 404, fallback to /api
    if (response.status === 404 && !endpoint.startsWith('/v1')) {
      const fallbackUrl = `${FALLBACK_API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      response = await fetch(fallbackUrl, { ...options, headers });
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText || `HTTP ${response.status}` };
      }
      throw new Error(errorJson.message || `Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
}
