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
  TrendingUp,
  Calculator,
  Save,
  StickyNote,
  Euro,
  Users,
  Minus,
  Receipt,
  Menu,
  X,
  AlertTriangle,
  Plane,
  Car,
  CreditCard,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Estados para dados do dashboard
  const [dashboardData, setDashboardData] = useState({
    totalSalary: 0,
    monthlyExpenses: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para adicionar salário
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryLoading, setSalaryLoading] = useState(false);
  
  // Estados para lembretes
  const [reminderText, setReminderText] = useState('');
  const [reminders, setReminders] = useState([]);
  
  // Estado para notificação
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Estado para menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadReminders();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000); // Remove após 3 segundos
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = () => {
    const saved = localStorage.getItem('reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  };

  const handleAddSalary = async () => {
    if (!salaryAmount || parseFloat(salaryAmount) <= 0) {
      showNotification('Por favor, digite um valor válido para o salário', 'error');
      return;
    }

    if (!user?.id) {
      showNotification('Usuário não encontrado. Faça login novamente.', 'error');
      return;
    }

    try {
      setSalaryLoading(true);
      
      console.log('🟦 Enviando salário:', { 
        amount: parseFloat(salaryAmount),
        userId: user.id 
      });
      
      // Chamar a API para adicionar o salário
      const result = await salaryService.addSalary(
        parseFloat(salaryAmount), 
        user.id, 
        'Salário'
      );
      
      console.log('🟦 Resultado:', result);
      
      showNotification('Salário adicionado com sucesso!', 'success');
      setSalaryAmount('');
      setShowSalaryForm(false);
      
      // Recarregar dados do dashboard
      loadDashboardData();
      
      // Recarregar dados do dashboard
      await loadDashboardData();
    } catch (err) {
      console.error('🔴 Erro completo:', err);
      console.error('🔴 Resposta do servidor:', err.response?.data);
      console.error('🔴 Status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      showNotification('Erro ao adicionar salário: ' + errorMessage, 'error');
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleAddReminder = () => {
    if (!reminderText.trim()) {
      showNotification('Por favor, digite um lembrete', 'error');
      return;
    }

    const newReminder = {
      id: Date.now(),
      text: reminderText.trim(),
      createdAt: new Date().toLocaleString('pt-BR')
    };

    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
    setReminderText('');
  };

  const handleDeleteReminder = (id) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
  };

  const handleLogout = () => {
    logout();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Notificação */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                JS FinanceApp
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Toggle tema */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* Informações do usuário */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getGreeting()}, {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bem-vindo de volta!
                  </p>
                </div>
                
                {/* Avatar */}
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Avatar mobile */}
              <div className="sm:hidden h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Botão de logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação em Abas */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-1 overflow-x-auto scrollbar-hide">
            {/* Aba Dashboard (Ativa) */}
            <button
              className="flex items-center px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-400 rounded-t-lg whitespace-nowrap"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </button>

            {/* Aba Despesas */}
            <button
              onClick={() => navigate('/expenses')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-b-2 border-transparent hover:border-red-300 dark:hover:border-red-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Despesas
            </button>

            {/* Aba Investimentos */}
            <button
              onClick={() => navigate('/investments')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border-b-2 border-transparent hover:border-green-300 dark:hover:border-green-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Investimentos
            </button>

            {/* Abas dos Fundos */}
            <button
              onClick={() => navigate('/funds/emergencia')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-b-2 border-transparent hover:border-red-300 dark:hover:border-red-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergência
            </button>

            <button
              onClick={() => navigate('/funds/viagem')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
            >
              <Plane className="h-4 w-4 mr-2" />
              Viagem
            </button>

            <button
              onClick={() => navigate('/funds/carro')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
            >
              <Car className="h-4 w-4 mr-2" />
              Carro
            </button>

            <button
              onClick={() => navigate('/funds/mesada')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border-b-2 border-transparent hover:border-green-300 dark:hover:border-green-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Mesada
            </button>

            {/* Aba Relatórios */}
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-b-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <span className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Dashboard</span>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2">
              <div className="space-y-1">
                <div className="flex items-center w-full px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                  <Home className="h-4 w-4 mr-3" />
                  Dashboard
                </div>

                <button
                  onClick={() => {
                    navigate('/expenses');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <TrendingDown className="h-4 w-4 mr-3" />
                  Despesas
                </button>

                <button
                  onClick={() => {
                    navigate('/investments');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Investimentos
                </button>

                <button
                  onClick={() => {
                    navigate('/funds/emergencia');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <AlertTriangle className="h-4 w-4 mr-3" />
                  Fundo de Emergência
                </button>

                <button
                  onClick={() => {
                    navigate('/funds/viagem');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plane className="h-4 w-4 mr-3" />
                  Fundo de Viagem
                </button>

                <button
                  onClick={() => {
                    navigate('/funds/carro');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20"
                >
                  <Car className="h-4 w-4 mr-3" />
                  Reserva do Carro
                </button>

                <button
                  onClick={() => {
                    navigate('/funds/mesada');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Mesada
                </button>

                <button
                  onClick={() => {
                    navigate('/reports');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Relatórios
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Seção de adicionar salário */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Gerenciar Salário
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Adicione ou atualize seu salário mensal
              </p>
            </div>
            
            {!showSalaryForm ? (
              <button
                onClick={() => setShowSalaryForm(true)}
                className="btn-primary flex items-center justify-center w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Adicionar Salário
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Euro className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="number"
                    value={salaryAmount}
                    onChange={(e) => setSalaryAmount(e.target.value)}
                    placeholder="0,00"
                    className="input-field pl-8 sm:pl-10 w-full sm:w-32 text-sm sm:text-base py-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSalary}
                    disabled={salaryLoading}
                    className="btn-primary flex items-center justify-center flex-1 sm:flex-none text-sm sm:text-base py-2 px-3 sm:px-4"
                  >
                    {salaryLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Salvar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowSalaryForm(false);
                      setSalaryAmount('');
                    }}
                    className="btn-secondary text-sm sm:text-base py-2 px-3 sm:px-4"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Card 1 - Total de Salários */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4 md:p-6 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  Total Salários
                </h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 md:h-8 bg-blue-400 rounded w-16 sm:w-20 md:w-24"></div>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg md:text-2xl font-bold">
                    {formatCurrency(dashboardData.totalSalary)}
                  </p>
                )}
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 opacity-80" />
            </div>
            <p className="text-blue-100 text-xs sm:text-xs md:text-sm mt-1 sm:mt-2">
              Soma dos salários de todos os usuários
            </p>
          </div>
          
          {/* Card 2 - Total de Despesas */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 sm:p-4 md:p-6 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  Total Despesas
                </h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 md:h-8 bg-red-400 rounded w-16 sm:w-20 md:w-24"></div>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg md:text-2xl font-bold">
                    {formatCurrency(Math.abs(dashboardData.monthlyExpenses))}
                  </p>
                )}
              </div>
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 opacity-80" />
            </div>
            <p className="text-red-100 text-xs sm:text-xs md:text-sm mt-1 sm:mt-2">
              Total gasto por todos os usuários
            </p>
          </div>
          
          {/* Card 3 - Saldo Total */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 sm:p-4 md:p-6 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
                  <Calculator className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  Saldo Total
                </h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 md:h-8 bg-green-400 rounded w-16 sm:w-20 md:w-24"></div>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg md:text-2xl font-bold">
                    {formatCurrency(dashboardData.balance)}
                  </p>
                )}
              </div>
              <Euro className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 opacity-80" />
            </div>
            <p className="text-green-100 text-xs sm:text-xs md:text-sm mt-1 sm:mt-2">
              Salários - Despesas = Saldo
            </p>
          </div>
        </div>

        {/* Seção de lembretes */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <StickyNote className="h-5 w-5 mr-2" />
              Lembretes Personalizados
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adicione lembretes importantes sobre suas finanças
            </p>
          </div>

          {/* Formulário para adicionar lembrete */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                placeholder="Digite seu lembrete..."
                className="input-field flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddReminder()}
              />
              <button
                onClick={handleAddReminder}
                className="btn-primary flex items-center justify-center w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de lembretes */}
          {reminders.length > 0 ? (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">{reminder.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {reminder.createdAt}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Excluir lembrete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum lembrete criado ainda</p>
            </div>
          )}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
