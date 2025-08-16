import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { investmentService, salaryService } from '../services/api';
import { 
  TrendingUp, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Euro, 
  Tag, 
  FileText,
  Trash2,
  Edit3,
  ArrowLeft,
  Save,
  DollarSign,
  PieChart,
  BarChart3,
  Coins,
  Building2,
  TrendingDown,
  Bitcoin,
  Menu,
  X,
  AlertTriangle,
  Plane,
  Car,
  CreditCard
} from 'lucide-react';

const INVESTMENT_TYPES = {
  ETF: { label: 'ETFs', icon: PieChart, color: 'blue' },
  ACAO: { label: 'Ações', icon: TrendingUp, color: 'green' },
  CRIPTO: { label: 'Criptomoedas', icon: Bitcoin, color: 'orange' },
  FUNDO: { label: 'Fundos', icon: Building2, color: 'purple' },
  RENDA_FIXA: { label: 'Renda Fixa', icon: BarChart3, color: 'gray' },
  OUTRO: { label: 'Outros', icon: Coins, color: 'indigo' }
};

const Investments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para dados
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalReturn: 0,
    returnPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para notificação
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Estados para formulários
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [entryFormData, setEntryFormData] = useState({
    name: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [investmentFormData, setInvestmentFormData] = useState({
    symbol: '',
    name: '',
    type: 'ETF',
    amount: '',
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);

  // Estados para acordeões
  const [expandedTypes, setExpandedTypes] = useState({});
  
  // Estado para menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadInvestments();
    loadSummary();
    loadAvailableBalance();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const loadAvailableBalance = async () => {
    try {
      const data = await salaryService.getAvailableBalance();
      setAvailableBalance(data.availableBalance || 0);
    } catch (err) {
      console.error('Erro ao carregar saldo disponível:', err);
    }
  };

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const data = await investmentService.getInvestments();
      setInvestments(data);
    } catch (err) {
      setError('Erro ao carregar investimentos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await investmentService.getInvestmentSummary();
      setSummary(data);
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
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

    try {
      setFormLoading(true);
      
      // Adicionar entrada ao salário (saldo positivo)
      await salaryService.transferFromSalary({
        amount: parseFloat(entryFormData.amount),
        type: 'INCOME',
        description: `${entryFormData.name} - ${entryFormData.description || 'Entrada de investimento'}`
      });
      
      // Resetar formulário
      setEntryFormData({
        name: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowEntryForm(false);
      
      // Recarregar saldo
      await loadAvailableBalance();
      
      showNotification('Sucesso!', 'success');
      
    } catch (err) {
      showNotification('Erro ao adicionar entrada: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    
    if (!investmentFormData.symbol || !investmentFormData.name || !investmentFormData.amount) {
      showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    if (parseFloat(investmentFormData.amount) <= 0) {
      showNotification('O valor deve ser maior que zero', 'error');
      return;
    }

    // Verificar se tem saldo suficiente
    if (parseFloat(investmentFormData.amount) > availableBalance) {
      showNotification(`Saldo insuficiente. Disponível: €${availableBalance.toFixed(2)}`, 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      const investmentData = {
        symbol: investmentFormData.symbol.toUpperCase(),
        name: investmentFormData.name,
        type: investmentFormData.type,
        description: investmentFormData.description,
        amount: parseFloat(investmentFormData.amount),
        currency: 'EUR',
        transferFromSalary: true // Sempre deduzir do saldo
      };

      // Usar sempre o serviço de transferência do salário
      await investmentService.createInvestmentWithSalaryTransfer(investmentData);
      
      // Resetar formulário
      setInvestmentFormData({
        symbol: '',
        name: '',
        type: 'ETF',
        amount: '',
        description: ''
      });
      setShowInvestmentForm(false);
      
      // Recarregar dados
      await loadInvestments();
      await loadSummary();
      await loadAvailableBalance();
      
      showNotification('Sucesso!', 'success');
      
    } catch (err) {
      showNotification('Erro ao adicionar investimento: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este investimento?')) {
      return;
    }

    try {
      await investmentService.deleteInvestment(id);
      await loadInvestments();
      await loadSummary();
      showNotification('Sucesso!', 'success');
    } catch (err) {
      showNotification('Erro ao excluir investimento', 'error');
    }
  };

  const toggleTypeExpansion = (type) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatPercentage = (percentage) => {
    return `${(percentage || 0).toFixed(2)}%`;
  };

  // Agrupar investimentos por tipo
  const groupedInvestments = investments.reduce((acc, investment) => {
    const type = investment.type || 'OUTRO';
    if (!acc[type]) acc[type] = [];
    acc[type].push(investment);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
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

            {/* Aba Investimentos (Ativa) */}
            <button
              className="flex items-center px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-b-2 border-green-600 dark:border-green-400 rounded-t-lg whitespace-nowrap"
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
              <span className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Investimentos</span>
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

                <div className="flex items-center w-full px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Investimentos
                </div>

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
        
        {/* Cards Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Card 1 - Total Investido */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4 md:p-6 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  Total Investido
                </h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 md:h-8 bg-blue-400 rounded w-16 sm:w-20 md:w-24"></div>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg md:text-2xl font-bold">
                    {formatCurrency(summary.totalInvested)}
                  </p>
                )}
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 opacity-80" />
            </div>
            <p className="text-blue-100 text-xs sm:text-xs md:text-sm mt-1 sm:mt-2">
              Soma de todas as entradas
            </p>
          </div>
          
          {/* Card 2 - Valor Atual dos Ativos */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 sm:p-4 md:p-6 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
                  <PieChart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  Valor Atual
                </h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-5 sm:h-6 md:h-8 bg-green-400 rounded w-16 sm:w-20 md:w-24"></div>
                  </div>
                ) : (
                  <p className="text-base sm:text-lg md:text-2xl font-bold">
                    {formatCurrency(summary.totalCurrentValue)}
                  </p>
                )}
                {!loading && (
                  <p className="text-xs mt-1">
                    Retorno: {formatPercentage(summary.returnPercentage)}
                  </p>
                )}
              </div>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 opacity-80" />
            </div>
            <p className="text-green-100 text-xs sm:text-xs md:text-sm mt-1 sm:mt-2">
              Valor total da carteira
            </p>
          </div>
        </div>

        {/* Seção para adicionar entrada e investimento */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gerenciar Investimentos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adicione entradas ou registre novos investimentos
              </p>
            </div>
            
            {!showEntryForm && !showInvestmentForm && (
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <button
                  onClick={() => setShowEntryForm(true)}
                  className="btn-primary flex items-center justify-center flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Entrada
                </button>
                <button
                  onClick={() => setShowInvestmentForm(true)}
                  className="btn-secondary flex items-center justify-center flex-1"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Adicionar Investimento
                </button>
              </div>
            )}
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
                      placeholder="Ex: Salário, Bonus..."
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

          {/* Formulário de Investimento */}
          {showInvestmentForm && (
            <form onSubmit={handleAddInvestment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Símbolo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Símbolo/Ticker *
                  </label>
                  <input
                    type="text"
                    value={investmentFormData.symbol}
                    onChange={(e) => setInvestmentFormData({...investmentFormData, symbol: e.target.value})}
                    placeholder="Ex: AAPL, VWCE, BTC"
                    className="input-field"
                    required
                  />
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Ativo *
                  </label>
                  <input
                    type="text"
                    value={investmentFormData.name}
                    onChange={(e) => setInvestmentFormData({...investmentFormData, name: e.target.value})}
                    placeholder="Ex: Apple Inc., Vanguard FTSE All-World"
                    className="input-field"
                    required
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Investimento *
                  </label>
                  <select
                    value={investmentFormData.type}
                    onChange={(e) => setInvestmentFormData({...investmentFormData, type: e.target.value})}
                    className="input-field"
                    required
                  >
                    {Object.entries(INVESTMENT_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>

                {/* Valor Inicial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor Inicial (€) *
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={investmentFormData.amount}
                      onChange={(e) => setInvestmentFormData({...investmentFormData, amount: e.target.value})}
                      placeholder="0,00"
                      className="input-field pl-10"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={investmentFormData.description}
                  onChange={(e) => setInvestmentFormData({...investmentFormData, description: e.target.value})}
                  placeholder="Notas sobre este investimento..."
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

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                      Adicionar Investimento
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvestmentForm(false);
                    setInvestmentFormData({
                      symbol: '',
                      name: '',
                      type: 'ETF',
                      amount: '',
                      description: ''
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Lista de Investimentos por Tipo (Acordeões) */}
        <div className="space-y-4">
          {Object.entries(INVESTMENT_TYPES).map(([typeKey, typeInfo]) => {
            const investmentsOfType = groupedInvestments[typeKey] || [];
            const isExpanded = expandedTypes[typeKey];
            const Icon = typeInfo.icon;

            if (investmentsOfType.length === 0) return null;

            return (
              <div key={typeKey} className="card">
                {/* Header do Acordeão */}
                <button
                  onClick={() => toggleTypeExpansion(typeKey)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Icon className={`h-6 w-6 mr-3 text-${typeInfo.color}-600`} />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {typeInfo.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {investmentsOfType.length} {investmentsOfType.length === 1 ? 'ativo' : 'ativos'}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? 
                    <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  }
                </button>

                {/* Conteúdo do Acordeão */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                    {investmentsOfType.map((investment) => (
                      <div
                        key={investment._id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {investment.symbol}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-800 dark:bg-${typeInfo.color}-900/20 dark:text-${typeInfo.color}-300`}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {investment.name}
                            </p>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p>Valor Atual: <span className="font-medium">{formatCurrency(investment.currentAmount)}</span></p>
                              <p>Transações: {investment.transactions?.length || 0}</p>
                              {investment.description && (
                                <p className="mt-2 text-xs">{investment.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(investment._id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                              title="Excluir investimento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensagem quando não há investimentos */}
        {!loading && investments.length === 0 && (
          <div className="card text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum investimento cadastrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comece adicionando seu primeiro investimento para acompanhar sua carteira.
            </p>
            <button
              onClick={() => setShowInvestmentForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Investimento
            </button>
          </div>
        )}

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

export default Investments;
