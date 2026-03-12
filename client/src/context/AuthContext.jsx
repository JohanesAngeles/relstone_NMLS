import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore from whichever storage has a token
  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser  = localStorage.getItem('user')  || sessionStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenData, rememberMe = false) => {
    // Clear both storages first to avoid stale conflicts
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    if (rememberMe) {
      // Remember me ON → persist across browser restarts
      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      // Remember me OFF → session only, but ALWAYS also put in
      // localStorage so axios interceptor can find it
      sessionStorage.setItem('token', tokenData);
      sessionStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
    }

    setToken(tokenData);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);