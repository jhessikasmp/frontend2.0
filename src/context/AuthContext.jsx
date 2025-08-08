import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    
    if (token && user) {
      dispatch({ type: 'SET_USER', payload: user });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const register = async (userData) => {
    try {
      console.log('🔄 Iniciando registro...', userData);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await authService.register(userData);
      console.log('✅ Resposta do registro:', response);
      
      // Backend2 não usa tokens - apenas verifica se o usuário foi criado
      if (response.success && response.user) {
        // Salvar dados do usuário sem token
        localStorage.setItem('user', JSON.stringify(response.user));
        dispatch({ type: 'SET_USER', payload: response.user });
        console.log('✅ Usuário registrado com sucesso (sem token)');
        return { success: true, data: response };
      }
      
      console.log('❌ Resposta inválida:', response);
      return { success: false, error: 'Erro no registro - resposta inválida' };
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao registrar usuário';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (userData) => {
    try {
      console.log('🔄 Iniciando login...', userData);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await authService.login(userData);
      console.log('✅ Resposta do login:', response);
      
      // Backend2 não usa tokens - apenas verifica se o usuário existe
      if (response.success && response.user) {
        // Salvar dados do usuário sem token
        localStorage.setItem('user', JSON.stringify(response.user));
        dispatch({ type: 'SET_USER', payload: response.user });
        console.log('✅ Usuário logado com sucesso (sem token)');
        return { success: true, data: response };
      }
      
      console.log('❌ Resposta inválida:', response);
      return { success: false, error: 'Erro no login - resposta inválida' };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer login';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
