// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { reportService, salaryService } from '../services/api';
import {
  LogOut,
  Sun,
  Moon,
  Home,
  Plus,
  DollarSign,
  TrendingDown,
  Calculator,
  Euro,
  Users,
  Minus,
  StickyNote,
  Save
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const userId = user?._id; // agora corretamente disponível

  // Dados do dashboard
  const [dashboardData, setDashboardData] = useState({
    totalSalary: 0,
    monthlyExpenses: 0,
    balance: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Salário
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryLoading, setSalaryLoading] = useState(false);

  // Lembretes
  const [reminderText, setReminderText] = useState('');
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });

  // Notificações
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoadingData(true);
        const data = await reportService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoadingData(false);
      }
    };
    loadDashboard();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddSalary = async () => {
    if (!salaryAmount || parseFloat(salaryAmount) <= 0) {
      return showNotification('Digite um valor válido', 'error');
    }
    if (!userId) {
      return showNotification('Usuário não encontrado. Faça login novamente.', 'error');
    }
    try {
      setSalaryLoading(true);
      await salaryService.addSalary(parseFloat(salaryAmount), userId);
      showNotification('Salário adicionado!', 'success');
      setSalaryAmount('');
      setShowSalaryForm(false);
      const data = await reportService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro desconhecido';
      showNotification('Erro ao adicionar salário: ' + msg, 'error');
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleAddReminder = () => {
    if (!reminderText.trim()) {
      return showNotification('Digite um lembrete', 'error');
    }
    const newR = { id: Date.now(), text: reminderText.trim(), createdAt: new Date().toLocaleString('pt-BR') };
    const upd = [...reminders, newR];
    setReminders(upd);
    localStorage.setItem('reminders', JSON.stringify(upd));
    setReminderText('');
  };

  const handleDeleteReminder = id => {
    const upd = reminders.filter(r => r.id !== id);
    setReminders(upd);
    localStorage.setItem('reminders', JSON.stringify(upd));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = amt =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amt || 0);

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-primary-600" />
            <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">JS FinanceApp</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} title={isDarkMode ? 'Modo claro' : 'Modo escuro'}>
              {isDarkMode ? <Sun className="h-5 w-5 text-gray-900 dark:text-white" /> : <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
            </button>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{getGreeting()}, {user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Bem-vindo de volta!</p>
              </div>
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <button onClick={handleLogout} title="Sair" className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
              <LogOut className="h-5 w-5"/>
            </button>
          </div>
        </div>
      </header>

      {/* Navegação em Abas */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        {/* ... seu JSX original de navegação ... */}
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Gerenciar Salário */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Gerenciar Salário</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Adicione ou atualize seu salário mensal</p>
            </div>
            {!showSalaryForm ? (
              <button onClick={() => setShowSalaryForm(true)} className="btn-primary flex items-center space-x-2">
                <Plus className="h-4 w-4"/> <span>Adicionar Salário</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <div className="relative">
                  <Euro className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                  <input
                    type="number"
                    value={salaryAmount}
                    onChange={e => setSalaryAmount(e.target.value)}
                    placeholder="0,00"
                    className="input-field pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
                <button onClick={handleAddSalary} disabled={salaryLoading} className="btn-primary flex items-center space-x-2">
                  {salaryLoading ? <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"/> : <Save className="h-4 w-4"/>}
                  <span>Salvar</span>
                </button>
                <button onClick={() => { setShowSalaryForm(false); setSalaryAmount(''); }} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Salários */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="flex items-center text-sm font-semibold">
                  <Users className="mr-1"/> Total Salários
                </h3>
                <p className="mt-2 text-2xl font-bold">{loadingData ? '...' : formatCurrency(dashboardData.totalSalary)}</p>
              </div>
              <DollarSign className="h-8 w-8 opacity-80"/>
            </div>
            <p className="mt-1 text-xs text-blue-100">Soma dos salários de todos os usuários</p>
          </div>

          {/* Total Despesas */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="flex items-center text-sm font-semibold">
                  <Minus className="mr-1"/> Total Despesas
                </h3>
                <p className="mt-2 text-2xl font-bold">{loadingData ? '...' : formatCurrency(Math.abs(dashboardData.monthlyExpenses))}</p>
              </div>
              <TrendingDown className="h-8 w-8 opacity-80"/>
            </div>
            <p className="mt-1 text-xs text-red-100">Total gasto por todos os usuários</p>
          </div>

          {/* Saldo Total */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="flex items-center text-sm font-semibold">
                  <Calculator className="mr-1"/> Saldo Total
                </h3>
                <p className="mt-2 text-2xl font-bold">{loadingData ? '...' : formatCurrency(dashboardData.balance)}</p>
              </div>
              <Euro className="h-8 w-8 opacity-80"/>
            </div>
            <p className="mt-1 text-xs text-green-100">Salários - Despesas = Saldo</p>
          </div>
        </div>

        {/* Lembretes */}
        <div className="card">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
              <StickyNote className="mr-2"/> Lembretes Personalizados
            </h3>
          </div>
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              value={reminderText}
              onChange={e => setReminderText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddReminder()}
              placeholder="Digite seu lembrete..."
              className="input-field flex-1"
            />
            <button onClick={handleAddReminder} className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4"/> <span>Adicionar</span>
            </button>
          </div>
          {reminders.length > 0 ? (
            <ul className="space-y-3">
              {reminders.map(r => (
                <li key={r.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 dark:text-white">{r.text}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{r.createdAt}</p>
                  </div>
                  <button onClick={() => handleDeleteReminder(r.id)} className="text-red-500 dark:text-red-400 p-1">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum lembrete criado ainda
            </div>
          )}
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
