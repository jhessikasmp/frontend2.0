import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carrega usuário salvo ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const register = async ({ name }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register({ name });
      setUser(res);
      localStorage.setItem('user', JSON.stringify(res));
      return { success: true, user: res };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ name }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login({ name });
      setUser(res);
      localStorage.setItem('user', JSON.stringify(res));
      return { success: true, user: res };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
