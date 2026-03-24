import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

// ── Helper: wipe every auth key from both storages ───────────────────────────
const clearAuthStorage = () => {
  ['token', 'user'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);
  const idleTimerRef = useRef(null);

  // ── On app load: validate stored token against the server ────────────────
  // Calls /auth/me which runs authMiddleware → checks is_active, expiry, existence.
  // If the account is deactivated, middleware returns 403 isInactive →
  // axios interceptor clears storage and redirects. This catch block handles
  // all other failures (expired token, user deleted, network error).
  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser  = localStorage.getItem('user')  || sessionStorage.getItem('user');

    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    API.get('/auth/me')
      .then((res) => {
        // Server confirmed token is valid and account is active
        setToken(storedToken);
        setUser(res.data.user);
      })
      .catch(() => {
        // axios interceptor already handles 403/401 redirects.
        // For anything else (network error, 500, etc.) just clear and stay put.
        clearAuthStorage();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (userData, tokenData, rememberMe = false) => {
    clearAuthStorage();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', tokenData);
    storage.setItem('user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  };

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  }, []);

  // ── Idle auto-logout ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !token || !user) return;

    const IDLE_MS = 6 * 60 * 1000;

    const clear = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    };

    const start = () => {
      clear();
      idleTimerRef.current = setTimeout(logout, IDLE_MS);
    };

    start();

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, start, { passive: true }));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, start));
      clear();
    };
  }, [loading, token, user, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);