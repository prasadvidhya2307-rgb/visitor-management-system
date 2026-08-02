// This module intentionally stores only client preferences. Visitor-management data
// is always read from and written to the backend API in api.js.
import { clearSession, getSession } from './api';

const SETTINGS_KEY = 'vms_settings';
const PROFILE_KEY = 'vms_profile';
const defaults = { theme: 'light' };
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };

const store = {
  getAuthUser: getSession,
  logout: clearSession,
  getSettings: () => ({ ...defaults, ...read(SETTINGS_KEY, {}) }),
  saveSetting: (key, value) => localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...store.getSettings(), [key]: value })),
  getProfile: () => ({ ...getSession(), ...read(PROFILE_KEY, {}) }),
  saveProfile: data => localStorage.setItem(PROFILE_KEY, JSON.stringify(data)),
};

export default store;
