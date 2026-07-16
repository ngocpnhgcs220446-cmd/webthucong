import toast from 'react-hot-toast';

const STORAGE_KEY = 'adminToken';

// ─── Token helpers ─────────────────────────────────────────────────────────
export const getToken = () => sessionStorage.getItem(STORAGE_KEY);
export const setToken = (token) => sessionStorage.setItem(STORAGE_KEY, token);
export const removeToken = () => sessionStorage.removeItem(STORAGE_KEY);

// ─── apiFetch (LEGACY — returns Response object) ───────────────────────────
// Kept for backward compatibility with existing code that does res.ok / res.json()
export const apiFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    removeToken();
    toast.error('Session expired. Please log in again.', { id: 'session-expired' });
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return res;
};

// ─── apiCall (NEW — auto-parses JSON, throws structured errors) ────────────
// Usage: const data = await apiCall('/api/services', { method: 'POST', body: payload })
// body can be: plain object (auto JSON.stringify + Content-Type) or FormData (no Content-Type set)
export const apiCall = async (url, options = {}) => {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;

  // Auto-stringify plain objects
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers, body });
  } catch (networkErr) {
    const err = new Error('Network error — please check your connection.');
    err.status = 0;
    err.fields = {};
    throw err;
  }

  // Session expired
  if (res.status === 401 || res.status === 403) {
    removeToken();
    toast.error('Session expired. Please log in again.', { id: 'session-expired' });
    window.location.href = '/login';
    const err = new Error('Session expired');
    err.status = res.status;
    err.fields = {};
    throw err;
  }

  // Parse body
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || 'Unknown response' };
  }

  // Throw structured error
  if (!res.ok) {
    const err = new Error(
      data?.error || data?.message || `Request failed with status ${res.status}`
    );
    err.status = res.status;
    err.fields = data?.fields || {};
    throw err;
  }

  return data;
};

// ─── uploadImage — uses apiCall, validates file before sending ─────────────
export const uploadImage = async (file) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be under 5MB.');
  }
  const form = new FormData();
  form.append('image', file);
  return apiCall('/api/upload', { method: 'POST', body: form });
};
