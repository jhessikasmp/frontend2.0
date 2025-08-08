import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fundService, salaryService } from '../services/api';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Euro, 
  FileText,
  Trash2,
  ArrowLeft,
  Save,
  DollarSign,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Car,
  Plane,
  AlertTriangle,
  CreditCard,
  Menu,
  X
} from 'lucide-react';

const FUND_CONFIGS = {
  EMERGENCIA: {
    title: 'Fundo de Emergência',
    icon: AlertTriangle,
    color: 'red',
    description: 'Reserve para situações inesperadas'
  },
  VIAGEM: {
    title: 'Fundo de Viagem',
    icon: Plane,
    color: 'blue',
    description: 'Economias para suas próximas aventuras'
  },
  CARRO: {
    title: 'Reserva do Carro',
    icon: Car,
    color: 'gray',
    description: 'Manutenção e despesas do veículo'
  },
  MESADA: {
    title: 'Mesada',
    icon: CreditCard,
    color: 'green',
    description: 'Gastos pessoais e diversão'
  }
};

const FundPage = ({ fundType }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const config = FUND_CONFIGS[fundType];

  // Estados para dados
  const [summary, setSummary] = useState({
    totalEntries: 0,
    totalExpenses: 0,
    balance: 0,
    entriesCount: 0,
    expensesCount: 0
  });
  const [history, setHistory] = useState({
    entries: [],
    expenses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para formulários
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [entryFormData, setEntryFormData] = useState({
    name: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [expenseFormData, setExpenseFormData] = useState({
    name: '',
    amount: '',
    description: '',
    category: 'OUTROS',
    date: new Date().toISOString().split('T')[0]
  });
  const [formLoading, setFormLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);

  // Estados para acordeões
  const [showEntries, setShowEntries] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  
  // Estado para menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados para notificações
  const [notification, setNotification] = useState({ message: '', type: '', show: false });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    loadData();
    loadAvailableBalance();
  }, [fundType]);

  const loadAvailableBalance = async () => {
    try {
      const data = await salaryService.getAvailableBalance();
      setAvailableBalance(data.availableBalance || 0);
    } catch (err) {
      console.error('Erro ao carregar saldo disponível:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, historyData] = await Promise.all([
        fundService.getFundSummary(fundType.toLowerCase()),
        fundService.getFundHistory(fundType.toLowerCase())
      ]);
      setSummary(summaryData);
      setHistory(historyData);
    } catch (err) {
      setError('Erro ao carregar dados do fundo');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    
    if (!entryFormData.name || !entryFormData.amount) {
      showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    if (parseFloat(entryFormData.amount) <= 0) {
      showNotification('O valor deve ser maior que zero', 'error');
      return;
    }

    // Verificar se tem saldo suficiente
    if (parseFloat(entryFormData.amount) > availableBalance) {
      showNotification(`Saldo insuficiente. Disponível: €${availableBalance.toFixed(2)}`, 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      const entryData = {
        ...entryFormData,
        amount: parseFloat(entryFormData.amount),
        transferFromSalary: true // Sempre deduzir do saldo
      };

      // Usar sempre o serviço de transferência do salário
      await fundService.addEntryWithSalaryTransfer(fundType.toLowerCase(), entryData);
      
      // Resetar formulário
      setEntryFormData({
        name: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowEntryForm(false);
      
      // Recarregar dados
      await loadData();
      await loadAvailableBalance();
      
      showNotification('Sucesso!', 'success');
    } catch (err) {
      showNotification('Erro ao adicionar entrada: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (!expenseFormData.name || !expenseFormData.amount) {
      showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    if (parseFloat(expenseFormData.amount) <= 0) {
      showNotification('O valor deve ser maior que zero', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      await fundService.addExpense(fundType.toLowerCase(), {
        ...expenseFormData,
        amount: parseFloat(expenseFormData.amount)
      });
      
      // Resetar formulário
      setExpenseFormData({
        name: '',
        amount: '',
        description: '',
        category: 'OUTROS',
        date: new Date().toISOString().split('T')[0]
      });
      setShowExpenseForm(false);
      
      // Recarregar dados
      await loadData();
      
      showNotification('Sucesso!', 'success');
    } catch (err) {
      showNotification('Erro ao adicionar despesa: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) {
      return;
    }

    try {
      await fundService.deleteEntry(entryId);
      await loadData();
      showNotification('Sucesso!', 'success');
    } catch (err) {
      showNotification('Erro ao excluir entrada', 'error');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
      return;
    }

    try {
      await fundService.deleteExpense(expenseId);
      await loadData();
      showNotification('Sucesso!', 'success');
    } catch (err) {
      showNotification('Erro ao excluir despesa', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Icon className={`h-8 w-8 text-${config.color}-600`} />
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                JS FinanceApp
              </h1>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {user?.username}
            </div>
          </div>
        </div>
      </div>

      {/* Navegação em Abas */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-1 overflow-x-auto scrollbar-hide">
            {/* Aba Dashboard */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
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
              className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                fundType === 'EMERGENCIA' 
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b-2 border-red-600 dark:border-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-b-2 border-transparent hover:border-red-300 dark:hover:border-red-700'
              }`}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergência
            </button>

            <button
              onClick={() => navigate('/funds/viagem')}
              className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                fundType === 'VIAGEM' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <Plane className="h-4 w-4 mr-2" />
              Viagem
            </button>

            <button
              onClick={() => navigate('/funds/carro')}
              className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                fundType === 'CARRO' 
                  ? 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-b-2 border-gray-600 dark:border-gray-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <Car className="h-4 w-4 mr-2" />
              Carro
            </button>

            <button
              onClick={() => navigate('/funds/mesada')}
              className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                fundType === 'MESADA' 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-b-2 border-green-600 dark:border-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border-b-2 border-transparent hover:border-green-300 dark:hover:border-green-700'
              }`}
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
              <span className="ml-3 text-lg font-medium text-gray-900 dark:text-white">{config.title}</span>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-3" />
                  Dashboard
                </button>

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
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium ${
                    fundType === 'EMERGENCIA' 
                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 mr-3" />
                  Fundo de Emergência
                </button>

                <button
                  onClick={() => {
                    navigate('/funds/viagem');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium ${
                    fundType === 'VIAGEM' 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <Plane className="h-4 w-4 mr-3" />
                  Fundo de Viagem
                </button>

                <button
                  onClick={() => {
                    navigate('/funds/carro');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium ${
                    fundType === 'CARRO' 
                      ? 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20'
                  }`}
                >
                  <Car className="h-4 w-4 mr-3" />
                  Reserva do Carro
                </button>

                <button
                  onClick={() => {
                    navigate('/funds/mesada');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium ${
                    fundType === 'MESADA' 
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
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
        
        {/* Header da página */}
        <div className="text-center">
          <Icon className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto text-${config.color}-600 mb-3 sm:mb-4`} />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {config.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {config.description}
          </p>
        </div>

        {/* Cards Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Card 1 - Total de Entradas */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 sm:p-4 md:p-6 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  Total Entradas
                </h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 md:h-8 bg-green-400 rounded w-16 sm:w-20 md:w-24"></div>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg md:text-2xl font-bold">
                    {formatCurrency(summary.totalEntries)}
                  </p>
                )}
                <p className="text-xs mt-1">
                  {summary.entriesCount} {summary.entriesCount === 1 ? 'entrada' : 'entradas'}
                </p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 opacity-80" />
            </div>
          </div>
          
          {/* Card 2 - Total de Despesas */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 sm:p-4 md:p-6 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  Total Gastos
                </h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 md:h-8 bg-red-400 rounded w-16 sm:w-20 md:w-24"></div>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg md:text-2xl font-bold">
                    {formatCurrency(summary.totalExpenses)}
                  </p>
                )}
                <p className="text-xs mt-1">
                  {summary.expensesCount} {summary.expensesCount === 1 ? 'gasto' : 'gastos'}
                </p>
              </div>
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 opacity-80" />
            </div>
          </div>
          
          {/* Card 3 - Saldo */}
          <div className={`bg-gradient-to-r ${summary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} p-3 sm:p-4 md:p-6 rounded-lg text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
                  <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  Saldo
                </h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 md:h-8 bg-blue-400 rounded w-16 sm:w-20 md:w-24"></div>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg md:text-2xl font-bold">
                    {formatCurrency(summary.balance)}
                  </p>
                )}
                <p className="text-xs mt-1">
                  {summary.balance >= 0 ? 'Disponível' : 'Déficit'}
                </p>
              </div>
              <Euro className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <button
              onClick={() => setShowEntryForm(true)}
              className="btn-primary flex items-center justify-center flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Entrada
            </button>
          </div>
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Gasto
          </button>
        </div>

        {/* Formulário de Entrada */}
        {showEntryForm && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Adicionar Entrada
            </h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Entrada *
                  </label>
                  <input
                    type="text"
                    value={entryFormData.name}
                    onChange={(e) => setEntryFormData({...entryFormData, name: e.target.value})}
                    placeholder="Ex: Salário, Freelance..."
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor (€) *
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={entryFormData.amount}
                      onChange={(e) => setEntryFormData({...entryFormData, amount: e.target.value})}
                      placeholder="0,00"
                      className="input-field pl-10"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={entryFormData.date}
                    onChange={(e) => setEntryFormData({...entryFormData, date: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={entryFormData.description}
                  onChange={(e) => setEntryFormData({...entryFormData, description: e.target.value})}
                  placeholder="Observações sobre esta entrada..."
                  className="input-field"
                  rows="3"
                />
              </div>

              {/* Informação sobre saldo disponível */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Saldo disponível: <span className="font-medium ml-1">{formatCurrency(availableBalance)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary flex items-center justify-center flex-1"
                >
                  {formLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Entrada
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEntryForm(false);
                    setEntryFormData({
                      name: '',
                      amount: '',
                      description: '',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulário de Despesa */}
        {showExpenseForm && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Adicionar Gasto
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Gasto *
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.name}
                    onChange={(e) => setExpenseFormData({...expenseFormData, name: e.target.value})}
                    placeholder="Ex: Combustível, Passagem..."
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor (€) *
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={expenseFormData.amount}
                      onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                      placeholder="0,00"
                      className="input-field pl-10"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={expenseFormData.category}
                    onChange={(e) => setExpenseFormData({...expenseFormData, category: e.target.value})}
                    className="input-field"
                  >
                    <option value="ALIMENTACAO">Alimentação</option>
                    <option value="COMBUSTIVEL">Combustível</option>
                    <option value="ALUGUEL">Aluguel</option>
                    <option value="SAUDE">Saúde</option>
                    <option value="EDUCACAO">Educação</option>
                    <option value="LAZER">Lazer</option>
                    <option value="BOLLETA">Bolleta</option>
                    <option value="DOACAO">Doação</option>
                    <option value="INTERNET">Internet</option>
                    <option value="STREAMING">Streaming</option>
                    <option value="TELEFONE">Telefone</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={expenseFormData.date}
                    onChange={(e) => setExpenseFormData({...expenseFormData, date: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                  placeholder="Observações sobre este gasto..."
                  className="input-field"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center flex-1"
                >
                  {formLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Gasto
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Histórico - Acordeões */}
        <div className="space-y-4">
          {/* Acordeão de Entradas */}
          <div className="card">
            <button
              onClick={() => setShowEntries(!showEntries)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-green-600" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Entradas
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {history.entries.length} {history.entries.length === 1 ? 'entrada' : 'entradas'}
                  </p>
                </div>
              </div>
              {showEntries ? 
                <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                <ChevronRight className="h-5 w-5 text-gray-400" />
              }
            </button>

            {showEntries && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                {history.entries.length > 0 ? (
                  history.entries.map((entry) => (
                    <div
                      key={entry._id}
                      className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {entry.name}
                          </h4>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400 my-1">
                            {formatCurrency(entry.amount)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(entry.date)}
                          </p>
                          {entry.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {entry.description}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                          title="Excluir entrada"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma entrada registrada ainda</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Acordeão de Gastos */}
          <div className="card">
            <button
              onClick={() => setShowExpenses(!showExpenses)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <TrendingDown className="h-6 w-6 mr-3 text-red-600" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Gastos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {history.expenses.length} {history.expenses.length === 1 ? 'gasto' : 'gastos'}
                  </p>
                </div>
              </div>
              {showExpenses ? 
                <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                <ChevronRight className="h-5 w-5 text-gray-400" />
              }
            </button>

            {showExpenses && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                {history.expenses.length > 0 ? (
                  history.expenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {expense.name}
                          </h4>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400 my-1">
                            {formatCurrency(Math.abs(expense.amount))}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{formatDate(expense.date)}</span>
                            <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                              {expense.category}
                            </span>
                          </div>
                          {expense.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {expense.description}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                          title="Excluir gasto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum gasto registrado ainda</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Notificação */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {notification.message}
          </div>
        )}
      </main>
    </div>
  );
};

export default FundPage;
