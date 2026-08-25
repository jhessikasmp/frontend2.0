import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

import { FaMoneyBillWave, FaWallet, FaPiggyBank, FaUserCircle, FaBell, FaBars, FaEye, FaEyeSlash, FaChartLine, FaCoins, FaTrash } from 'react-icons/fa';
import { useValueVisibility } from '../context/ValueVisibilityContext';

import { safeGetFromStorage } from '../utils/storage';
import { getCurrentMonthTotalExpensesWithEntries } from '../services/getCurrentMonthTotalExpensesWithEntries';
const apiUrl = import.meta.env.VITE_API_URL;

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = [
    { label: 'Dashboard', path: '/dashboard', icon: <FaWallet className="inline mr-2 text-lg align-middle" /> },
    { label: 'Despesas', path: '/dashboard/despesas', icon: <FaMoneyBillWave className="inline mr-2 text-lg align-middle" /> },
    { label: 'Investimento', path: '/dashboard/investimento', icon: <FaPiggyBank className="inline mr-2 text-lg align-middle" /> },
    { label: 'Emergência', path: '/dashboard/emergencia', icon: <FaBell className="inline mr-2 text-lg align-middle" /> },
    { label: 'Viagens', path: '/dashboard/viagens', icon: <FaUserCircle className="inline mr-2 text-lg align-middle" /> },
    { label: 'Relatório Anual', path: '/dashboard/relatorio-anual', icon: <FaChartLine className="inline mr-2 text-lg align-middle" /> },
  ];

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return false;
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showValues, setShowValues } = useValueVisibility();
  const [salaryTotal, setSalaryTotal] = useState<number | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');
  const [salaryDate, setSalaryDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [expenseTotal, setExpenseTotal] = useState<number | null>(null);
  const [expenseLoading, setExpenseLoading] = useState(false);

  const [salaryHistory, setSalaryHistory] = useState<{ month: string; total: number }[]>([]);
  const [expenseHistory, setExpenseHistory] = useState<{ month: string; total: number }[]>([]);

  const fetchHistoryData = async (userId: string) => {
    // Fetch expenses from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const fromDate = sixMonthsAgo.toISOString().split('T')[0];

    const [expRes, invRes, salaryRes] = await Promise.all([
      fetch(`${apiUrl}/api/expense/user/${userId}`),
      fetch(`${apiUrl}/api/investment/user/${userId}`),
      fetch(`${apiUrl}/api/salary/user/${userId}`)
    ]);

    const expData = await expRes.json();
    const invData = await invRes.json();
    const salaryData = await salaryRes.json();

    const expenses = expData.data || [];
    const investments = invData.data || [];
    const salaries = Array.isArray(salaryData.data) ? salaryData.data : (salaryData.data ? [salaryData.data] : []);

    const recentExpenses = expenses.filter((e: any) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d >= sixMonthsAgo;
    });

    const totalExpenses = recentExpenses.reduce((sum: number, e: any) => sum + Number(e.value || 0), 0);
    const monthlyAverage = totalExpenses / 6;

    const categoryTotals: Record<string, number> = {};
    recentExpenses.forEach((e: any) => {
      const cat = e.category || 'Outros';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.value || 0);
    });

    const totalInvestments = investments.reduce((sum: number, i: any) => {
      const val = Number(i.valor || i.value || 0);
      return sum + val;
    }, 0);

    // Build salary history
    const monthlyMap: Record<string, number> = {};
    salaries.forEach((s: any) => {
      if (s.date) {
        const d = new Date(s.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + Number(s.value || 0);
      }
    });
    const salaryHistoryArr = Object.entries(monthlyMap)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
    setSalaryHistory(salaryHistoryArr);

    // Build expense history
    const expMonthlyMap: Record<string, number> = {};
    expenses.forEach((e: any) => {
      if (e.date) {
        const d = new Date(e.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        expMonthlyMap[key] = (expMonthlyMap[key] || 0) + Number(e.value || 0);
      }
    });
    const expenseHistoryArr = Object.entries(expMonthlyMap)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
    setExpenseHistory(expenseHistoryArr);

    return { totalExpenses, monthlyAverage, totalInvestments, categoryTotals, totalDespesasRegistradas: recentExpenses.length };
  };

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchUserExpenseTotal(currentUser._id);
      fetchHistoryData(currentUser._id);
    }
  }, [currentUser]);

  const fetchUserExpenseTotal = async (userId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/expense/user/${userId}`);
      await res.json();
    } catch (e) { }
  };

  useEffect(() => {
    fetchExpenseTotal();
  }, []);

  const fetchExpenseTotal = async () => {
    setExpenseLoading(true);
    try {
      const total = await getCurrentMonthTotalExpensesWithEntries();
      setExpenseTotal(total);
    } catch (e) {
      setExpenseTotal(null);
    } finally {
      setExpenseLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchSalaryTotal(currentUser._id);
      fetchUserSalary(currentUser._id);
    }
  }, [currentUser]);

  const fetchSalaryTotal = async (userId?: string) => {
    setSalaryLoading(true);
    try {
      const query = userId ? `?userId=${userId}` : '';
      const res = await fetch(`${apiUrl}/api/salary/current-month-total${query}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSalaryTotal(data.total);
      } else {
        setSalaryTotal(null);
      }
    } catch (e) {
      setSalaryTotal(null);
    } finally {
      setSalaryLoading(false);
    }
  };

  const fetchUserSalary = async (userId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/salary/user/${userId}`);
      await res.json();
    } catch (e) {
      setSalaryInput('');
    }
  };

  const handleSaveSalary = async () => {
    if (!currentUser || !salaryInput || !salaryDate) return;
    setSalaryLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/salary/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser._id, value: Number(salaryInput), date: salaryDate })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const now = new Date();
        fetchSalaryTotal(currentUser._id);
        fetchExpenseTotal();
        setSalaryInput('');
        setSalaryDate(now.toISOString().slice(0, 10));
        setShowSalaryForm(false);
      } else {
        alert(data.message || 'Erro ao salvar salário. Tente novamente.');
      }
    } catch (e) {
      alert('Erro de conexão ao salvar salário.');
    }
    setSalaryLoading(false);
  };

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const stored = safeGetFromStorage('currentUser', null);
    const userId: string | null = typeof stored === 'string' ? stored : stored && stored._id ? stored._id : null;

    if (!userId) {
      window.location.href = '/login';
      return;
    }
    fetchCurrentUser(userId);
  }, []);

  const fetchCurrentUser = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}`);
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const saldoMes = (salaryTotal !== null && expenseTotal !== null) ? salaryTotal - expenseTotal : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center mb-4">
          <div className="flex items-center min-w-0">
            <button className="md:hidden mr-3" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
              <FaBars className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>
            <FaWallet className="h-8 w-8 text-primary-600 shrink-0" />
            <div className="ml-3 flex flex-col min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">JSFinance</h1>
              {currentUser?.name && (
                <span className="text-sm text-gray-600 dark:text-gray-300 font-normal truncate">Bem-vindo, {currentUser.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setDark(d => !d)} title={dark ? 'Modo claro' : 'Modo escuro'}>
              {dark ? <span className="h-5 w-5">🌙</span> : <span className="h-5 w-5">☀️</span>}
            </button>
            <button onClick={() => setShowValues(!showValues)} title={showValues ? 'Ocultar valores' : 'Mostrar valores'}>
              {showValues ? <FaEye className="h-5 w-5" /> : <FaEyeSlash className="h-5 w-5" />}
            </button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 shadow transition-colors duration-200">Sair</button>
          </div>
        </div>
      </header>

      {/* Menu lateral mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end md:hidden">
          <div className="w-2/3 max-w-xs bg-white dark:bg-gray-800 h-full shadow-lg flex flex-col">
            <button
              className="self-end m-4 p-2 focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex flex-col gap-0">
              {tabs.map(tab => (
                <button
                  key={tab.path}
                  onClick={() => { setMobileMenuOpen(false); navigate(tab.path); }}
                  className={`w-full text-left px-6 py-4 text-base font-medium border-b border-gray-200 dark:border-gray-700 focus:outline-none transition-colors
                    ${location.pathname === tab.path ? 'bg-primary-600 text-white dark:bg-primary-700' : 'text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900'}`
                  }
                >
                  <span className="text-xl mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Navegação em abas (desktop) */}
      <nav className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 rounded-t-lg
                  ${location.pathname === tab.path ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border-b-2 border-transparent hover:border-primary-300 dark:hover:border-primary-700'}`
                }
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {location.pathname === '/dashboard' ? (
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {/* Cards principais - Layout melhorado */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Salário */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-800 dark:to-blue-950 p-5 rounded-xl text-white shadow-lg flex flex-col justify-between min-h-[120px] border border-blue-400/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center text-sm font-semibold opacity-90"><FaMoneyBillWave className="mr-2"/> Salário</h3>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">{!showValues ? '•••' : salaryLoading ? <span className="animate-pulse">...</span> : salaryTotal !== null ? `€ ${salaryTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : <span className="text-lg">--</span>}</p>
              <p className="text-xs opacity-75 mt-1">Este mês</p>
            </div>

            {/* Despesas */}
            <div className="bg-gradient-to-br from-red-500 to-red-700 dark:from-red-800 dark:to-red-950 p-5 rounded-xl text-white shadow-lg flex flex-col justify-between min-h-[120px] border border-red-400/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center text-sm font-semibold opacity-90"><FaWallet className="mr-2"/> Despesas</h3>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">{!showValues ? '•••' : expenseLoading ? <span className="animate-pulse">...</span> : expenseTotal !== null ? `€ ${expenseTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : <span className="text-lg">--</span>}</p>
              <p className="text-xs opacity-75 mt-1">Este mês</p>
            </div>

            {/* Saldo */}
            <div className="bg-gradient-to-br from-green-500 to-green-700 dark:from-green-800 dark:to-green-950 p-5 rounded-xl text-white shadow-lg flex flex-col justify-between min-h-[120px] border border-green-400/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center text-sm font-semibold opacity-90"><FaPiggyBank className="mr-2"/> Saldo</h3>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">
                {!showValues ? '•••' : salaryLoading || expenseLoading ? <span className="animate-pulse">...</span> :
                  saldoMes !== null
                    ? `€ ${saldoMes.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
                    : <span className="text-lg">--</span>}
              </p>
              {saldoMes !== null && (
                <p className={`text-xs mt-1 ${saldoMes >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  {saldoMes >= 0 ? '✅ Positivo' : '⚠️ Negativo'}
                </p>
              )}
            </div>

          </div>

          {/* Botão Salário - Melhorado */}
          <div className="w-full">
            {!showSalaryForm ? (
              <button
                className="w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 text-white flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 via-green-600 to-emerald-700 hover:from-green-600 hover:via-green-700 hover:to-emerald-800 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] border-2 border-green-400/30"
                onClick={() => setShowSalaryForm(true)}
              >
                <FaCoins className="text-2xl" />
                <span>Adicionar Salário do Mês</span>
                <span className="text-xs opacity-75 ml-2">💰</span>
              </button>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FaCoins className="text-2xl text-green-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Adicionar Salário</h3>
                </div>
                <div className="flex flex-row flex-wrap gap-3 items-center">
                  <input type="number" className="input flex-1 min-w-[140px] rounded-lg border-gray-300 dark:border-gray-600" value={salaryInput} onChange={e => setSalaryInput(e.target.value)} min={0} placeholder="Salário do mês (em Euro)" />
                  <input type="date" className="input flex-1 min-w-[140px] rounded-lg border-gray-300 dark:border-gray-600" value={salaryDate} onChange={e => setSalaryDate(e.target.value)} />
                  <button
                    className="px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all duration-200 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    onClick={handleSaveSalary}
                    disabled={salaryLoading || !salaryInput || !salaryDate}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Salvar Salário
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-lg font-semibold shadow-md transition-all duration-200 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white flex items-center gap-2"
                    onClick={() => { setShowSalaryForm(false); setSalaryInput(''); setSalaryDate(new Date().toISOString().slice(0, 10)); }}
                    disabled={salaryLoading}
                  >
                    Cancelar
                  </button>
                  {salaryLoading && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <span className="text-sm">Salvando...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Resumo Rápido */}
          {salaryHistory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="text-blue-500" />
                  Histórico de Salários
                </h3>
                <div className="space-y-2">
                  {salaryHistory.map((item) => (
                    <div key={item.month} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.month + '-01').toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        € {item.total.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FaWallet className="text-red-500" />
                  Histórico de Despesas
                </h3>
                <div className="space-y-2">
                  {expenseHistory.map((item) => (
                    <div key={item.month} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.month + '-01').toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        € {item.total.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Dashboard;