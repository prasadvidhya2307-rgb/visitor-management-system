const DEFAULT_BASE_URL = 'http://localhost:5000/api/v1';

export const BASE_URL = process.env.REACT_APP_API_URL || DEFAULT_BASE_URL;

const TOKEN_KEY = 'vms_access_token';

let memoryToken = null;

export function getToken() {
  return memoryToken || localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  memoryToken = token || null;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  memoryToken = null;
  localStorage.removeItem(TOKEN_KEY);
}

const unauthorizedListeners = [];

export function onUnauthorized(cb) {
  unauthorizedListeners.push(cb);
  return () => {
    const i = unauthorizedListeners.indexOf(cb);
    if (i >= 0) unauthorizedListeners.splice(i, 1);
  };
}

function emitUnauthorized() {
  unauthorizedListeners.forEach((cb) => {
    try { cb(); } catch (e) { /* ignore */ }
  });
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message || 'Something went wrong.');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = (mimeMatch && mimeMatch[1]) || 'image/jpeg';
  const bytes = atob(parts[1]);
  const ab = new ArrayBuffer(bytes.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

export async function request(path, { method = 'GET', body, formData, query } = {}) {
  let url = `${BASE_URL}${path}`;
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch (err) {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.', 0, null);
  }

  let json = null;
  try { json = await res.json(); } catch (e) { json = null; }

  if (res.status === 401) {
    clearToken();
    emitUnauthorized();
  }

  if (!res.ok || (json && json.success === false)) {
    let message = (json && json.message) || `Request failed (${res.status})`;
    const errData = (json && json.data) || null;
    if (errData && Array.isArray(errData.errors) && errData.errors.length) {
      const first = errData.errors[0];
      const field = first.field || '';
      message = field ? `${field}: ${first.message}` : first.message;
    }
    throw new ApiError(message, res.status, errData);
  }

  return json || { success: true, data: null };
}
