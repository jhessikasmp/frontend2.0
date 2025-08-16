import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingDown,
  Home,
  TrendingUp,
  AlertTriangle,
  Plane,
  Car,
  CreditCard,
  Menu,
  X,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { reportService } from '../services/api';

const Reports = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [selectedYear]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAnnualReport(selectedYear);
      setReportData(data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const years = [];
  for (let year = 2020; year <= new Date().getFullYear(); year++) {
    years.push(year);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
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
                    Relatórios Anuais
                  </p>
                </div>
                
                {/* Avatar */}
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Avatar mobile */}
              <div className="sm:hidden h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Botão de logout */}
              <button
                onClick={logout}
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
            {/* Aba Dashboard */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 rounded-t-lg transition-all duration-200 whitespace-nowrap"
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

            {/* Aba Relatórios (Ativa) */}
            <button
              className="flex items-center px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-b-2 border-purple-600 dark:border-purple-400 rounded-t-lg whitespace-nowrap"
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
              <span className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Relatórios</span>
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
                  <Home className="h-4 w-4 mr-3" />
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

                <div className="flex items-center w-full px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
                  <FileText className="h-4 w-4 mr-3" />
                  Relatórios
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Cabeçalho da página */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-purple-600" />
                Relatórios Anuais
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visualize o resumo financeiro anual por usuário
              </p>
            </div>
            
            {/* Seletor de ano */}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field w-auto min-w-[120px]"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de usuários com relatórios */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : reportData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportData.map((userReport, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {userReport.userName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Relatório de {selectedYear}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Painel 1 - Salário Total */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">
                          Salário Total
                        </h4>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                          {formatCurrency(userReport.totalSalary)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  {/* Painel 2 - Despesas Total */}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                          Despesas Total
                        </h4>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                          {formatCurrency(userReport.totalExpenses)}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum dado disponível
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não há dados financeiros para o ano de {selectedYear}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;
