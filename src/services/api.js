import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Backend2 não usa autenticação - interceptors comentados
/*
// Interceptador para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🟡 Requisição sem token (teste):', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/

// Backend2 não usa autenticação - interceptor de resposta comentado
/*
// Interceptador para lidar com respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
*/

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
    // localStorage.removeItem('token'); // Comentado - não usa token
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
  getAnnualReport: async (year) => {
    const response = await api.get(`/reports/annual?year=${year}`);
    return response.data;
  },

  getMonthlyReport: async (year, month) => {
    const response = await api.get(`/reports/monthly/${year}/${month}`);
    return response.data;
  },

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

  // Criar investimento com transferência do salário
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

  // Adicionar entrada com transferência do salário
  addEntryWithSalaryTransfer: async (fundType, entryData) => {
    const response = await api.post(`/funds/${fundType}/entry/salary-transfer`, entryData);
    return response.data;
  },
};

// Serviços de salário
export const salaryService = {
  addSalary: async (amount, userId = 'default-user', name = 'Salário') => {
    const response = await api.post('/salary/entries', { 
      userId, 
      name, 
      amount,
      description: 'Entrada de salário'
    });
    return response.data;
  },

  getAvailableBalance: async (userId = 'default-user') => {
    const response = await api.get(`/salary/summary?userId=${userId}`);
    return response.data;
  },

  transferFromSalary: async (transferData) => {
    const response = await api.post('/salary/transfer', transferData);
    return response.data;
  },

  getTransferHistory: async (userId = 'default-user') => {
    const response = await api.get(`/salary/history?userId=${userId}`);
    return response.data;
  },
};

export default api;
