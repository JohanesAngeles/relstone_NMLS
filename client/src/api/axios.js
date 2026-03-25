import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:8000/api'
});

// ── Helper: wipe every auth key from both storages ───────────────────────────
const clearAuthStorage = () => {
  ['token', 'user'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// ── Request Interceptor ──────────────────────────────────────────────────────
API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ─────────────────────────────────────────────────────
let isRedirecting = false;

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (isRedirecting) return Promise.reject(error);

    // 403 isInactive — clear storage but DO NOT redirect.
    // The calling component (AuthModal / AuthContext) catches this and shows
    // the error message inside the modal so the user sees why they're blocked.
    if (response?.status === 403 && response.data?.isInactive) {
      clearAuthStorage();
      return Promise.reject(error);
    }

    // 401 — expired or invalid token, hard redirect to home
    if (response?.status === 401) {
      isRedirecting = true;
      clearAuthStorage();
      window.location.replace('/');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API;