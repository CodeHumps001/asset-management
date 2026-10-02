export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

let token: string | null = null;
export const setAccessToken = (t: string | null) => { token = t; };

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string[]>) { super(message); }
}

let refreshing: Promise<any> | null = null;
/** Exchanges the httpOnly refresh cookie for a new access token. Returns the user profile or null. */
export function refreshSession(): Promise<any | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const r = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
        if (!r.ok) return null;
        const j = await r.json();
        token = j.accessToken;
        return j.user;
      } catch { return null; } finally { setTimeout(() => { refreshing = null; }, 0); }
    })();
  }
  return refreshing;
}

export async function api<T = any>(path: string, o: { method?: string; body?: unknown; query?: Record<string, any> } = {}): Promise<T> {
  const qs = o.query
    ? '?' + new URLSearchParams(Object.entries(o.query).filter(([, v]) => v !== undefined && v !== '' && v !== null).map(([k, v]) => [k, String(v)])).toString()
    : '';
  const send = () =>
    fetch(`${API_URL}${path}${qs}`, {
      method: o.method || 'GET',
      credentials: 'include',
      headers: { ...(o.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: o.body ? JSON.stringify(o.body) : undefined,
    });
  let res: Response;
  try { res = await send(); } catch { throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.'); }
  if (res.status === 401 && !path.startsWith('/auth/')) {
    if (await refreshSession()) res = await send();
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, json?.message || 'Something went wrong', json?.details);
  return json as T;
}
