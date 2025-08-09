// src/context/AuthContext.js

import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async ({ name }) => {
    setLoading(true);
    setError(null);
    try {
      // envia para o backend
      const user = await authService.register({ name });
      // salva no localStorage para as próximas requisições
      authService.saveUserData(user);
      setLoading(false);
      return { success: true, user };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Erro no registro de usuário';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const login = async ({ name }) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.login({ name });
      authService.saveUserData(user);
      setLoading(false);
      return { success: true, user };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Erro no login de usuário';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ register, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
