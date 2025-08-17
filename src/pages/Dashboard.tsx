import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

import { FaMoneyBillWave, FaWallet, FaPiggyBank, FaUserCircle, FaBell, FaBars } from 'react-icons/fa';
import { safeGetFromStorage } from '../utils/storage';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = [
    { label: 'Dashboard', path: '/dashboard', icon: <FaWallet className="inline mr-2 text-lg align-middle" /> },
    { label: 'Despesas', path: '/dashboard/despesas', icon: <FaMoneyBillWave className="inline mr-2 text-lg align-middle" /> },
    { label: 'Investimento', path: '/dashboard/investimento', icon: <FaPiggyBank className="inline mr-2 text-lg align-middle" /> },
    { label: 'Emergência', path: '/dashboard/emergencia', icon: <FaBell className="inline mr-2 text-lg align-middle" /> },
    { label: 'Viagens', path: '/dashboard/viagens', icon: <FaUserCircle className="inline mr-2 text-lg align-middle" /> },
    { label: 'Carro', path: '/dashboard/carro', icon: <FaWallet className="inline mr-2 text-lg align-middle" /> },
    { label: 'Mesada', path: '/dashboard/mesada', icon: <FaMoneyBillWave className="inline mr-2 text-lg align-middle" /> },
    { label: 'Relatório Anual', path: '/dashboard/relatorio-anual', icon: <FaPiggyBank className="inline mr-2 text-lg align-middle" /> },
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
  const [userExpenseLoading, setUserExpenseLoading] = useState(false);
  // --- Lembretes ---
  const [reminders, setReminders] = useState<any[]>([]);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderEditId, setReminderEditId] = useState<string | null>(null);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderContent, setReminderContent] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  // Buscar lembretes do usuário ao carregar
  // Função correta para buscar todos os lembretes
  const fetchAllReminders = async () => {
    setReminderLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/reminder');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setReminders(data.data);
      } else {
        setReminders([]);
      }
    } catch (e) {
      setReminders([]);
    } finally {
      setReminderLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReminders();
  }, []);

  const handleSaveReminder = async () => {
    if (!currentUser || !reminderTitle) return;
    setReminderLoading(true);
    try {
      const method = reminderEditId ? 'PUT' : 'POST';
      const url = reminderEditId
        ? `http://localhost:5000/api/reminder/${reminderEditId}`
        : 'http://localhost:5000/api/reminder';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser._id,
          title: reminderTitle,
          content: reminderContent,
          date: reminderDate
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchAllReminders();
        setReminderEditId(null);
        setReminderTitle('');
        setReminderContent('');
        setReminderDate('');
      }
    } catch (e) {}
    setReminderLoading(false);
  };

  const handleEditReminder = (reminder: any) => {
    setReminderEditId(reminder._id);
    setReminderTitle(reminder.title);
    setReminderContent(reminder.content || '');
    setReminderDate(reminder.date ? reminder.date.slice(0, 10) : '');
  };

  const handleDeleteReminder = async (id: string) => {
    setReminderLoading(true);
    try {
      await fetch(`http://localhost:5000/api/reminder/${id}`, { method: 'DELETE' });
      fetchAllReminders();
    } catch (e) {}
    setReminderLoading(false);
  };

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchUserExpenseTotal(currentUser._id);
    }
  }, [currentUser]);

  const fetchUserExpenseTotal = async (userId: string) => {
    setUserExpenseLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/expense/user/${userId}`);
      const data = await res.json();
  // ...existing code...
    } catch (e) {
      // ...existing code...
    } finally {
      setUserExpenseLoading(false);
    }
  };
  // Buscar total de despesas do mês atual ao carregar
  useEffect(() => {
    fetchExpenseTotal();
  }, []);

  const fetchExpenseTotal = async () => {
    setExpenseLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/expense/current-month-total');
      const data = await res.json();
      if (data.success) {
        setExpenseTotal(data.total);
      } else {
        setExpenseTotal(null);
      }
    } catch (e) {
      setExpenseTotal(null);
    } finally {
      setExpenseLoading(false);
    }
  };

  // Buscar salário total do mês de todos os usuários ao carregar
  useEffect(() => {
    fetchSalaryTotal();
    if (currentUser && currentUser._id) {
      fetchUserSalary(currentUser._id);
    }
  }, [currentUser]);

  const fetchSalaryTotal = async () => {
    setSalaryLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/salary/current-month-total');
      const data = await res.json();
      if (data.success) {
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
      const res = await fetch(`http://localhost:5000/api/salary/user/${userId}`);
      const data = await res.json();
  // ...existing code...
    } catch (e) {
      setSalaryInput('');
    }
  };

  const handleSaveSalary = async () => {
    if (!currentUser || !salaryInput || !salaryDate) return;
    setSalaryLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/salary/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser._id, value: Number(salaryInput), date: salaryDate })
      });
      const data = await res.json();
      // Só atualiza o card se o salário adicionado for do mês atual
      const now = new Date();
      const salaryDateObj = new Date(data.data?.date);
      // Limpa os campos após adicionar
      setSalaryInput('');
      setSalaryDate(now.toISOString().slice(0, 10));
    } catch (e) {}
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
    // Corrigido:usar safeGetFromStorage e extrair só o _id para evitar problemas na URL
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
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center mb-4">
          <div className="flex items-center">
            <button className="md:hidden mr-3" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
              <FaBars className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </button>
            <FaWallet className="h-8 w-8 text-primary-600" />
            <div className="ml-3 flex flex-col">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">JS FinanceApp</h1>
              {currentUser?.name && (
                <span className="text-sm text-gray-600 dark:text-gray-300 font-normal">Bem-vindo, {currentUser.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setDark(d => !d)} title={dark ? 'Modo claro' : 'Modo escuro'}>
              {dark ? <span className="h-5 w-5">🌙</span> : <span className="h-5 w-5">☀️</span>}
            </button>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">Sair</button>
            <FaUserCircle className="h-8 w-8 text-gray-400 ml-2" />
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
          {/* Cards principais */}
          {/* Botão para mostrar formulário de salário */}
          <div className="mb-6 w-full flex flex-row items-center">
            {!showSalaryForm && (
              <button
                className="px-6 py-2 rounded-xl font-semibold text-base shadow-md transition-colors duration-200 text-white flex items-center gap-2 border border-zinc-300 dark:border-zinc-700"
                style={{ backgroundColor: '#9da4b0' }}
                onClick={() => setShowSalaryForm(true)}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Adicionar Salário do Mês
              </button>
            )}
            {showSalaryForm && (
              <div className="flex flex-row flex-wrap gap-2 items-center w-full">
                <input type="number" className="input flex-1 min-w-[120px]" value={salaryInput} onChange={e => setSalaryInput(e.target.value)} min={0} placeholder="Salário do mês (em Euro)" />
                <input type="date" className="input flex-1 min-w-[120px]" value={salaryDate} onChange={e => setSalaryDate(e.target.value)} />
                <button
                  className="btn-primary px-6 py-2 rounded-xl font-semibold text-base shadow-md transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  onClick={handleSaveSalary}
                  disabled={salaryLoading || !salaryInput || !salaryDate}
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Salvar Salário
                </button>
                <button
                  className="btn-secondary px-4 py-2 rounded-xl font-semibold text-base shadow-md transition-colors duration-200 bg-gray-300 hover:bg-gray-400 text-gray-800 flex items-center gap-2"
                  onClick={() => { setShowSalaryForm(false); setSalaryInput(''); setSalaryDate(new Date().toISOString().slice(0, 10)); }}
                  disabled={salaryLoading}
                >
                  Cancelar
                </button>
                {salaryLoading && <span className="text-gray-500 ml-2">Salvando...</span>}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-800 dark:to-blue-900 p-4 rounded-lg text-white shadow-lg flex flex-col justify-between min-h-[80px]">
              <h3 className="flex items-center text-sm font-semibold"><FaMoneyBillWave className="mr-1"/> Salário do Mes (Todos Usuários)</h3>
              <p className="mt-2 text-2xl font-bold">{salaryLoading ? '...' : salaryTotal !== null ? `€ ${salaryTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : 'Não informado'}</p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-700 dark:to-red-900 p-4 rounded-lg text-white shadow-lg flex flex-col justify-between min-h-[80px]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="flex items-center text-sm font-semibold"><FaWallet className="mr-1"/> Despesas do Mes</h3>
                  <p className="mt-2 text-2xl font-bold">{expenseLoading ? '...' : expenseTotal !== null ? `€ ${expenseTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : 'Não informado'}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-700 dark:to-green-900 p-4 rounded-lg text-white shadow-lg flex flex-col justify-between min-h-[80px]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="flex items-center text-sm font-semibold"><FaPiggyBank className="mr-1"/> Saldo do Mes (Global)</h3>
                  <p className="mt-2 text-2xl font-bold">
                    {salaryLoading || expenseLoading ? '...' :
                      (salaryTotal !== null && expenseTotal !== null)
                        ? `€ ${(salaryTotal - expenseTotal).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
                        : 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lembretes */}
          <div className="card mt-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <div className="flex items-center mb-4">
              <FaBell className="text-xl text-yellow-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-yellow-100">Lembrete</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Título do lembrete</label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={e => setReminderTitle(e.target.value)}
                  placeholder="Título"
                  className="input w-full"
                  maxLength={50}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Conteúdo do lembrete</label>
                <input
                  type="text"
                  value={reminderContent}
                  onChange={e => setReminderContent(e.target.value)}
                  placeholder="Conteúdo"
                  className="input w-full"
                  maxLength={120}
                />
              </div>
            </div>
            <div className="mb-6 flex gap-2">
              <button
                onClick={handleSaveReminder}
                className="btn-primary px-6 py-2 rounded-xl font-semibold text-base shadow-md transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                disabled={reminderLoading || !reminderTitle}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                {reminderEditId ? 'Salvar edição' : 'Adicionar'}
              </button>
              {reminderEditId && (
                <button className="btn-secondary" onClick={() => { setReminderEditId(null); setReminderTitle(''); setReminderContent(''); }} disabled={reminderLoading}>Cancelar</button>
              )}
            </div>
            {reminderLoading ? (
              <div className="flex flex-col items-center justify-center w-full py-16">
                <FaBell className="text-5xl text-gray-400 mb-4 animate-pulse" />
                <span className="text-gray-300 text-lg">Carregando lembretes...</span>
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-16">
                <FaBell className="text-5xl text-gray-600 mb-4" />
                <span className="text-gray-400 text-lg">Nenhum lembrete.</span>
              </div>
            ) : (
              <ul className="space-y-3">
                {reminders.map(reminder => (
                  <li key={reminder._id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">{reminder.title}</p>
                      {reminder.content && <p className="text-gray-700 dark:text-gray-200 text-sm mt-1">{reminder.content}</p>}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold" onClick={() => handleEditReminder(reminder)} disabled={reminderLoading}>Editar</button>
                      <button className="text-xs text-red-700 dark:text-red-400 hover:underline font-semibold" onClick={() => handleDeleteReminder(reminder._id)} disabled={reminderLoading}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Dashboard;
