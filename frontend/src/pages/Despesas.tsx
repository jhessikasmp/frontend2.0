import React, { useState, useEffect, useCallback } from 'react';
import { useValueVisibility } from '../context/ValueVisibilityContext';
const apiUrl = import.meta.env.VITE_API_URL;
import { FaWallet, FaTrash, FaMoneyBillWave, FaCalendarAlt, FaPlusCircle, FaRedo } from 'react-icons/fa';
import { deleteExpense } from '../services/deleteExpense';
import { safeGetFromStorage } from '../utils/storage';

const categorias = [
  'Supermercado', 'Aluguel', 'Combustível', 'Boletos', 'Saúde', 
  'Educação', 'Lazer', 'Doação', 'Internet', 'Streaming', 
  'Telefone', 'Outros'
];

const periodicidades = [
  { value: 'avulsa', label: 'Apenas Uma Vez' },
  { value: 'mensal', label: 'Todo Mês' },
  { value: 'bimestral', label: 'A cada 2 Meses' },
  { value: 'trimestral', label: 'A cada 3 Meses' },
];

interface Despesa {
  id?: string;
  nome: string;
  valor: number;
  categoria: string;
  data: string;
  descricao?: string;
  usuario?: string;
}

const Despesas: React.FC = () => {
  const { showValues } = useValueVisibility();
  const [form, setForm] = useState({ nome: '', valor: '', categoria: '', data: '', descricao: '', periodicidade: 'avulsa' });
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [groupedPrevious, setGroupedPrevious] = useState<Record<string, Despesa[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrent, setShowCurrent] = useState(true);
  const [showPrevious, setShowPrevious] = useState(false);
  const [totalMes, setTotalMes] = useState(0);

  const fetchAllDespesas = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/expense/all`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const despesasArr = data.data.map((d: any): Despesa => ({
          id: d._id,
          nome: d.name,
          valor: d.value,
          categoria: d.category,
          data: d.date ? d.date.slice(0, 10) : '',
          descricao: d.description,
          usuario: d.user?.name || d.user?.email || 'Usuário'
        }));
        setDespesas(despesasArr);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const prev: Record<string, Despesa[]> = {};
        despesasArr.forEach((d: Despesa) => {
          const dateObj = new Date(d.data);
          const m = dateObj.getMonth();
          const y = dateObj.getFullYear();
          if (y < currentYear || (y === currentYear && m < currentMonth)) {
            const key = `${y}-${String(m + 1).padStart(2, '0')}`;
            if (!prev[key]) prev[key] = [];
            prev[key].push(d);
          }
        });
        setGroupedPrevious(prev);
        const total = despesasArr.filter((d: Despesa) => {
          const now = new Date();
          const m = now.getMonth();
          const y = now.getFullYear();
          const dateObj = new Date(d.data);
          return dateObj.getMonth() === m && dateObj.getFullYear() === y;
        }).reduce((acc: number, d: Despesa) => acc + d.valor, 0);
        setTotalMes(total);
      }
    } catch (err) {
      setError('Erro ao buscar despesas.');
    }
  }, []);

  useEffect(() => {
    fetchAllDespesas();
  }, [fetchAllDespesas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.nome || !form.valor || !form.categoria || !form.data) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      const currentUser = safeGetFromStorage('currentUser', {});

      // Check if it's a recurring expense
      if (form.periodicidade !== 'avulsa') {
        // Add as recurring expense
        const recRes = await fetch(`${apiUrl}/api/recurring-expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: currentUser?._id,
            name: form.nome,
            value: Number(form.valor),
            category: form.categoria,
            description: form.descricao,
            frequency: form.periodicidade,
            startDate: form.data,
          })
        });
        const recData = await recRes.json();
        if (recData.success) {
          setSuccess('Despesa recorrente adicionada com sucesso!');
          setForm({ nome: '', valor: '', categoria: '', data: '', descricao: '', periodicidade: 'avulsa' });
          fetchAllDespesas();
        } else {
          setError(recData.message || 'Erro ao adicionar despesa recorrente');
        }
      } else {
        // Add as one-time expense
        const res = await fetch(`${apiUrl}/api/expense`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: currentUser?._id,
            name: form.nome,
            value: Number(form.valor),
            category: form.categoria,
            date: form.data,
            description: form.descricao,
          })
        });
        const data = await res.json();
        if (data && data.success) {
          setSuccess('Despesa adicionada com sucesso!');
          setForm({ nome: '', valor: '', categoria: '', data: '', descricao: '', periodicidade: 'avulsa' });
          fetchAllDespesas();
        } else {
          setError((data && data.message) || 'Erro ao adicionar despesa');
        }
      }
    } catch (err) {
      setError('Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-indigo-900 dark:to-blue-950 p-6 rounded-2xl text-white shadow-xl border border-blue-400/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaMoneyBillWave className="text-3xl" />
              Despesas
            </h1>
            <p className="text-blue-100 mt-1 opacity-80">Gerencie suas despesas mensais e recorrências</p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
            <FaWallet className="text-2xl opacity-80" />
            <div>
              <p className="text-xs opacity-70">Total do Mês</p>
              <p className="text-2xl font-bold">
                {!showValues ? '•••' : `€ ${totalMes.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Adicionar Despesa */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <FaPlusCircle className="text-blue-500" />
          Adicionar Despesa
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
            <input name="nome" value={form.nome} onChange={handleChange} className="input w-full rounded-xl" placeholder="ex: Aluguel" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (€) *</label>
            <input name="valor" value={form.valor} onChange={handleChange} className="input w-full rounded-xl" placeholder="0.00" type="number" min="0" step="0.01" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria *</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className="input w-full rounded-xl" required>
              <option value="">Selecione</option>
              {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data *</label>
            <input name="data" value={form.data} onChange={handleChange} className="input w-full rounded-xl" type="date" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodicidade</label>
            <select name="periodicidade" value={form.periodicidade} onChange={handleChange} className="input w-full rounded-xl">
              {periodicidades.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (opcional)</label>
            <textarea name="descricao" value={form.descricao} onChange={handleChange} className="input w-full rounded-xl" placeholder="Detalhes adicionais..." rows={2} />
          </div>
          <div className="md:col-span-2 lg:col-span-5">
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? 'Adicionando...' : <><FaPlusCircle /> Adicionar Despesa</>}
            </button>
          </div>
          {error && <div className="text-red-600 text-sm md:col-span-2 lg:col-span-5 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}
          {success && <div className="text-green-600 text-sm md:col-span-2 lg:col-span-5 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{success}</div>}
        </form>
        {form.periodicidade !== 'avulsa' && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
              <FaRedo className="text-sm" />
              Esta despesa será registrada como <strong>recorrente</strong> ({periodicidades.find(p => p.value === form.periodicidade)?.label}) e será gerada automaticamente nos próximos meses.
            </p>
          </div>
        )}
      </div>

      {/* Despesas do Mês Atual */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-800 dark:to-cyan-800 text-white font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
          onClick={() => setShowCurrent(v => !v)}
        >
          <span className="flex items-center gap-3">
            <FaCalendarAlt className="text-xl" />
            Despesas do Mês Atual
          </span>
          <span>{showCurrent ? '▲' : '▼'}</span>
        </button>
        {showCurrent && (
          <div className="p-6">
            {despesas.filter(d => {
              const now = new Date();
              const m = now.getMonth();
              const y = now.getFullYear();
              let dateObj;
              if (typeof d.data === 'string' && d.data.length === 10 && d.data.includes('-')) {
                const [year, month] = d.data.split('-');
                dateObj = { year: Number(year), month: Number(month) - 1 };
              } else {
                const jsDate = new Date(d.data);
                dateObj = { year: jsDate.getFullYear(), month: jsDate.getMonth() };
              }
              return dateObj.year === y && dateObj.month === m;
            }).length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">Nenhuma despesa lançada neste mês</div>
            )}
            <div className="space-y-3">
              {despesas.filter(d => {
                const now = new Date();
                const m = now.getMonth();
                const y = now.getFullYear();
                let dateObj;
                if (typeof d.data === 'string' && d.data.length === 10 && d.data.includes('-')) {
                  const [year, month] = d.data.split('-');
                  dateObj = { year: Number(year), month: Number(month) - 1 };
                } else {
                  const jsDate = new Date(d.data);
                  dateObj = { year: jsDate.getFullYear(), month: jsDate.getMonth() };
                }
                return dateObj.year === y && dateObj.month === m;
              }).map((d, i) => (
                <div key={d.id || i} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-750 rounded-xl p-4 flex justify-between items-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{d.nome}</div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{d.categoria}</span>
                      <span>{d.data}</span>
                      {d.usuario && <span className="text-blue-600 dark:text-blue-400">{d.usuario}</span>}
                    </div>
                    {d.descricao && <div className="text-xs text-gray-400 mt-1">{d.descricao}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-red-600 dark:text-red-400 text-lg">
                      {!showValues ? '•••' : `€ ${d.valor.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
                    </div>
                    <button
                      className="text-zinc-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      title="Excluir"
                      onClick={async () => {
                        if (!d.id) return;
                        if (!confirm('Confirma exclusão?')) return;
                        try {
                          await deleteExpense(d.id);
                          await fetchAllDespesas();
                        } catch (err) {
                          alert('Erro ao excluir');
                        }
                      }}
                    ><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meses Anteriores */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-gray-500 to-slate-600 dark:from-gray-700 dark:to-slate-800 text-white font-bold text-lg hover:from-gray-600 hover:to-slate-700 transition-all"
          onClick={() => setShowPrevious(v => !v)}
        >
          <span className="flex items-center gap-3">
            <FaCalendarAlt className="text-xl" />
            Meses Anteriores
          </span>
          <span>{showPrevious ? '▲' : '▼'}</span>
        </button>
        {showPrevious && (
          <div className="p-6 space-y-6">
            {Object.keys(groupedPrevious).length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">Nenhuma despesa de meses anteriores</div>
            )}
            {Object.entries(groupedPrevious).sort((a, b) => b[0].localeCompare(a[0])).map(([month, list]) => (
              <div key={month}>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  {new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  <span className="text-sm font-normal text-gray-400">
                    ({list.reduce((s, d) => s + d.valor, 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})
                  </span>
                </h3>
                <div className="space-y-2">
                  {list.map((d, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex justify-between items-center border border-gray-100 dark:border-gray-700/50">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{d.nome}</div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                          <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">{d.categoria}</span>
                          <span>{d.data}</span>
                        </div>
                        {d.descricao && <div className="text-xs text-gray-400 mt-1">{d.descricao}</div>}
                      </div>
                      <div className="font-bold text-red-600 dark:text-red-400">
                        {!showValues ? '•••' : `€ ${d.valor.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Despesas;