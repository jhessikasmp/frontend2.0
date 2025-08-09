// src/services/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Serviços de autenticação
export const authService = {
  register: async (userData) => {
    console.log('📡 Enviando requisição de registro para:', `${API_BASE_URL}/users/register`);
    console.log('📡 Dados enviados:', userData);
    const response = await api.post('/users/register', userData);
    console.log('📡 Resposta recebida:', response.data);
    return response.data;
  },

  login: async (userData) => {
    console.log('📡 Enviando requisição de login para:', `${API_BASE_URL}/users/login`);
    console.log('📡 Dados enviados:', userData);
    const response = await api.post('/users/login', userData);
    console.log('📡 Resposta recebida:', response.data);
    return response.data;
  },

  logout: () => {
    // Backend2 não usa tokens - apenas remove dados locais
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    // Backend2 não usa tokens
    return null;
  },

  saveUserData: (userData) => {
    // Backend2 não usa tokens - apenas salva dados do usuário
    localStorage.setItem('user', JSON.stringify(userData.user || userData));
  },
};

// Serviços de relatórios
export const reportService = {
  getDashboardData: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },
};

// Serviços de despesas
export const expenseService = {
  getAllExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getMonthlyExpenses: async (month, year) => {
    console.log('🔄 Buscando despesas:', { month, year });
    const response = await api.get(`/expenses/monthly/${month}/${year}`);
    console.log('🔄 Resposta:', response.data);
    return response.data;
  },

  getMonthlySummary: async () => {
    const response = await api.get('/expenses/summary');
    return response.data;
  },
};

// Serviços de investimentos
export const investmentService = {
  getInvestments: async () => {
    const response = await api.get('/investments');
    return response.data;
  },

  createInvestment: async (investmentData) => {
    const response = await api.post('/investments', investmentData);
    return response.data;
  },

  updateInvestment: async (id, investmentData) => {
    const response = await api.put(`/investments/${id}`, investmentData);
    return response.data;
  },

  deleteInvestment: async (id) => {
    const response = await api.delete(`/investments/${id}`);
    return response.data;
  },

  addTransaction: async (id, transactionData) => {
    const response = await api.post(`/investments/${id}/transaction`, transactionData);
    return response.data;
  },

  getInvestmentSummary: async () => {
    const response = await api.get('/investments/summary');
    return response.data;
  },

  createInvestmentWithSalaryTransfer: async (investmentData) => {
    const response = await api.post('/investments/salary-transfer', investmentData);
    return response.data;
  },
};

// Serviços de fundos
export const fundService = {
  getFundSummary: async (fundType) => {
    const response = await api.get(`/funds/${fundType}/summary`);
    return response.data;
  },

  getFundHistory: async (fundType) => {
    const response = await api.get(`/funds/${fundType}/history`);
    return response.data;
  },

  addEntry: async (fundType, entryData) => {
    const response = await api.post(`/funds/${fundType}/entries`, entryData);
    return response.data;
  },

  addExpense: async (fundType, expenseData) => {
    const response = await api.post(`/funds/${fundType}/expenses`, expenseData);
    return response.data;
  },

  deleteEntry: async (entryId) => {
    const response = await api.delete(`/funds/entries/${entryId}`);
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    const response = await api.delete(`/funds/expenses/${expenseId}`);
    return response.data;
  },

  addEntryWithSalaryTransfer: async (fundType, entryData) => {
    const response = await api.post(`/funds/${fundType}/entry/salary-transfer`, entryData);
    return response.data;
  },
};

// Serviços de salário
export const salaryService = {
  addSalary: async (amount, userId) => {
    const response = await api.post('/salary', { amount, userId });
    return response.data;
  },

  getAvailableBalance: async (userId) => {
    const response = await api.get(`/salary/summary?userId=${userId}`);
    return response.data;
  },

  getMonthlySummary: async () => {
    const response = await api.get('/salary/summary');
    return response.data;
  },

  transferFromSalary: async (transferData) => {
    const response = await api.post('/salary/transfer', transferData);
    return response.data;
  },

  getTransferHistory: async (userId) => {
    const response = await api.get(`/salary/history?userId=${userId}`);
    return response.data;
  },
};

// Serviços de lembretes
export const reminderService = {
  createReminder: async (userId, text) => {
    console.log('📡 Criando lembrete:', { userId, text });
    const response = await api.post('/reminders', { userId, text });
    console.log('📡 Lembrete criado:', response.data);
    return response.data;
  },

  getReminders: async (userId) => {
    console.log('📡 Buscando lembretes para userId:', userId);
    const response = await api.get(`/reminders?userId=${userId}`);
    console.log('📡 Lembretes encontrados:', response.data);
    return response.data;
  },

  updateReminder: async (id, text) => {
    console.log('📡 Atualizando lembrete:', { id, text });
    const response = await api.put(`/reminders/${id}`, { text });
    console.log('📡 Lembrete atualizado:', response.data);
    return response.data;
  },

  deleteReminder: async (id) => {
    console.log('📡 Deletando lembrete:', id);
    const response = await api.delete(`/reminders/${id}`);
    console.log('📡 Lembrete deletado');
    return response.data;
  },
};

export default api;
