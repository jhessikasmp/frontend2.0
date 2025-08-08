import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/api';
import { 
  Plus, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Euro, 
  Tag, 
  FileText,
  TrendingDown,
  Edit,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Menu,
  AlertTriangle,
  Plane,
  Car,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Expenses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados para o formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Estados para despesas
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState([]);
  const [previousMonthsExpenses, setPreviousMonthsExpenses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para acordeões
  const [currentMonthOpen, setCurrentMonthOpen] = useState(true);
  const [previousMonthsOpen, setPreviousMonthsOpen] = useState(false);
  const [openMonths, setOpenMonths] = useState({});
  
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

  // Categorias disponíveis
  const categories = [
    'ALIMENTACAO',
    'COMBUSTIVEL',
    'ALUGUEL',
    'SAUDE',
    'EDUCACAO',
    'LAZER',
    'BOLLETA',
    'DOACAO',
    'INTERNET',
    'STREAMING',
    'TELEFONE',
    'OUTROS'
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      
      // Carregar despesas do mês atual
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const currentExpenses = await expenseService.getMonthlyExpenses(currentMonth, currentYear);
      setCurrentMonthExpenses(currentExpenses);
      
      // Carregar despesas dos meses anteriores (últimos 6 meses)
      const previousMonths = {};
      for (let i = 1; i <= 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        try {
          const expenses = await expenseService.getMonthlyExpenses(month, year);
          if (expenses.length > 0) {
            previousMonths[monthKey] = {
              name: monthName,
              expenses: expenses
            };
          }
        } catch (err) {
          console.log(`Nenhuma despesa para ${monthName}`);
        }
      }
      
      setPreviousMonthsExpenses(previousMonths);
      
    } catch (err) {
      setError('Erro ao carregar despesas');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.amount || !formData.category) {
      showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      const expenseData = {
        ...formData,
        amount: -Math.abs(parseFloat(formData.amount)), // Garantir que seja negativo
        userId: user.id,
        date: new Date(formData.date)
      };

      await expenseService.createExpense(expenseData);
      
      // Resetar formulário
      setFormData({
        name: '',
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      
      // Recarregar despesas
      await loadExpenses();
      
      showNotification('Sucesso!', 'success');
    } catch (err) {
      showNotification('Erro ao adicionar despesa: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(Math.abs(amount || 0));
  };

  const formatCategory = (category) => {
    return category.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const toggleMonth = (monthKey) => {
    setOpenMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  const ExpenseCard = ({ expense, showDate = true }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 md:p-4 border border-gray-200 dark:border-gray-600">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-white">{expense.name}</h4>
          {expense.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{expense.description}</p>
          )}
          <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              {formatCategory(expense.category)}
            </span>
            {showDate && (
              <span className="flex items-center">
                <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                {new Date(expense.date).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
        <div className="text-right ml-2">
          <p className="text-sm sm:text-base md:text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(expense.amount)}
          </p>
          <div className="flex gap-1 mt-1 sm:mt-2">
            <button className="p-1 text-blue-500 hover:text-blue-700" title="Editar">
              <Edit className="h-3 w-3" />
            </button>
            <button className="p-1 text-red-500 hover:text-red-700" title="Excluir">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
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

            {/* Aba Despesas (Ativa) */}
            <button
              className="flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b-2 border-red-600 dark:border-red-400 rounded-t-lg whitespace-nowrap"
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
              <span className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Despesas</span>
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

                <div className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                  <TrendingDown className="h-4 w-4 mr-3" />
                  Despesas
                </div>

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
        
        {/* Seção para adicionar despesa */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Adicionar Nova Despesa
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Registre suas despesas para melhor controle financeiro
              </p>
            </div>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center justify-center w-full sm:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nova Despesa
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Despesa *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="input-field"
                    placeholder="Ex: Almoço no restaurante"
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
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      className="input-field pl-10"
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="input-field"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {formatCategory(category)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="input-field"
                  rows="3"
                  placeholder="Detalhes adicionais sobre a despesa..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary flex items-center"
                >
                  {formLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Container principal com duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Coluna 1: Despesas do mês atual (2/3 da largura) */}
          <div className="lg:col-span-2">
            <div className="card">
              <button
                onClick={() => setCurrentMonthOpen(!currentMonthOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  {currentMonthOpen ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 mr-3" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 mr-3" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Despesas de {getCurrentMonthName()}
                  </h3>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentMonthExpenses.length} despesas
                </span>
              </button>

              {currentMonthOpen && (
                <div className="px-4 pb-4">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : currentMonthExpenses.length > 0 ? (
                    <div className="space-y-3">
                      {currentMonthExpenses.map((expense) => (
                        <ExpenseCard key={expense._id} expense={expense} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma despesa registrada neste mês</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Coluna 2: Despesas dos meses anteriores (1/3 da largura) */}
          <div className="lg:col-span-1">
            <div className="card">
              <button
                onClick={() => setPreviousMonthsOpen(!previousMonthsOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  {previousMonthsOpen ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 mr-3" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 mr-3" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Meses Anteriores
                  </h3>
                </div>
              </button>

              {previousMonthsOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {Object.keys(previousMonthsExpenses).length > 0 ? (
                    Object.entries(previousMonthsExpenses).map(([monthKey, monthData]) => (
                      <div key={monthKey} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                        <button
                          onClick={() => toggleMonth(monthKey)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center">
                            {openMonths[monthKey] ? (
                              <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {monthData.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {monthData.expenses.length}
                          </span>
                        </button>
                        
                        {openMonths[monthKey] && (
                          <div className="px-3 pb-3 space-y-2">
                            {monthData.expenses.map((expense) => (
                              <div key={expense._id} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                      {expense.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatCategory(expense.category)}
                                    </p>
                                  </div>
                                  <p className="text-xs font-bold text-red-600 dark:text-red-400 ml-2">
                                    {formatCurrency(expense.amount)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Nenhum histórico encontrado</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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

export default Expenses;
