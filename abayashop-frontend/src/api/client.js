import { API_URL } from '../config';

const STORAGE_KEY = 'abaya.auth';

export const tokens = {
  get() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } },
  set(t) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); } catch { /* storage unavailable */ } },
  clear() { try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ } },
};

/** Turns any DRF / djoser error body into one human sentence. */
function messageFrom(data, status) {
  if (!data) return status >= 500 ? 'Something went wrong on our side. Please try again.' : `Request failed (${status})`;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.map(String).join(' ');
  if (data.detail) return String(data.detail);
  const first = Object.entries(data)[0];
  if (!first) return `Request failed (${status})`;
  const [field, msg] = first;
  const text = Array.isArray(msg) ? msg.join(' ') : typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
  return field === 'non_field_errors' ? text : `${field.replace(/_/g, ' ')}: ${text}`;
}

export class ApiError extends Error {
  constructor(status, data) {
    super(messageFrom(data, status));
    this.status = status;
    this.data = data;
  }
}

const qs = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : '';
};

let refreshing = null;
async function refreshAccess() {
  const t = tokens.get();
  if (!t?.refresh) return false;
  refreshing ??= fetch(`${API_URL}/auth/jwt/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: t.refresh }),
  })
    .then(async (r) => {
      if (!r.ok) { tokens.clear(); window.dispatchEvent(new Event('auth:expired')); return false; }
      tokens.set({ ...t, ...(await r.json()) });
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

/**
 * Thin fetch wrapper. Backend uses SimpleJWT with the `JWT` header prefix
 * (SIMPLE_JWT.AUTH_HEADER_TYPES = ('JWT',)).
 */
export async function api(path, { method = 'GET', body, params, auth = true, _retried = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const t = tokens.get();
  if (auth && t?.access) headers.Authorization = `JWT ${t.access}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}${qs(params)}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    console.error(`[KaltunsShop] Request to ${API_URL}${path} failed. Usually this is CORS (add ${window.location.origin} to the backend's CORS_ALLOWED_ORIGNS), a wrong VITE_API_URL, or http/https mixing.`);
    throw new ApiError(0, `Cannot reach the shop server at ${API_URL}. Check your connection, and that the backend allows ${window.location.origin} (CORS).`);
  }

  if (res.status === 401 && auth && t?.refresh && !_retried && (await refreshAccess())) {
    return api(path, { method, body, params, auth, _retried: true });
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
