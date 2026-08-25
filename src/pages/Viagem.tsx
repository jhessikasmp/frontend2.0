import React, { useEffect, useState } from 'react';
import { useValueVisibility } from '../context/ValueVisibilityContext';
import { FaMoneyBillWave, FaWallet, FaPiggyBank, FaTrash, FaPlusCircle, FaCalendarAlt, FaPlane } from 'react-icons/fa';
import { getViagemEntriesYear } from '../services/viagemEntryService';
import { getTotalViagemEntries } from '../services/getTotalViagemEntries';
import { getAllViagemExpenses } from '../services/getAllViagemExpenses';
import { getViagemExpensesByUserAndYear } from '../services/getViagemExpensesByUserAndYear';

const Viagem: React.FC = () => {
  const { showValues } = useValueVisibility();
  const [entradasAnual, setEntradasAnual] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalDespesasAno, setTotalDespesasAno] = useState(0);
  const [saldoFundo, setSaldoFundo] = useState(0);
  const [entradaValor, setEntradaValor] = useState('');
  const [entradasTotal, setEntradasTotal] = useState(0);
  const [despesas, setDespesas] = useState<any[]>([]);
  const [despesaNome, setDespesaNome] = useState('');
  const [despesaValor, setDespesaValor] = useState('');
  const [despesaData, setDespesaData] = useState('');
  const userId = (() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      if (raw.startsWith('{')) {
        return JSON.parse(raw)._id;
      }
      return raw;
    } catch {
      return null;
    }
  })();
  const [showEntradaForm, setShowEntradaForm] = useState(false);
  const [showDespesaForm, setShowDespesaForm] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  const atualizarTudo = async () => {
    const year = new Date().getFullYear();
    const entries = await getViagemEntriesYear('', year);
    const totalYear = entries.reduce((sum: number, e: any) => sum + (e.valor || 0), 0);
    setEntradasAnual(totalYear);
    const total = await getTotalViagemEntries();
    setEntradasTotal(total);
    const arr = await getAllViagemExpenses();
    setDespesas(arr);
    const totalExp = arr.reduce((sum: number, exp: any) => sum + (exp.valor || 0), 0);
    setTotalDespesas(totalExp);
    // Despesas apenas do ano corrente (por userId)
    if (userId) {
      const expensesYearArr = await getViagemExpensesByUserAndYear(userId, year);
      const totalExpYear = expensesYearArr.reduce((sum: number, exp: any) => sum + (exp.valor || 0), 0);
      setTotalDespesasAno(totalExpYear);
    }
  };

  useEffect(() => {
    atualizarTudo();
  }, []);

  useEffect(() => {
    setSaldoFundo((entradasAnual || 0) - (totalDespesasAno || 0));
  }, [entradasAnual, totalDespesasAno]);

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Cabeçalho melhorado */}
      <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 dark:from-sky-800 dark:via-blue-900 dark:to-blue-950 p-6 rounded-2xl text-white shadow-xl border border-sky-400/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaPlane className="text-3xl" />
              Fundo de Viagem
            </h1>
            <p className="text-sky-100 mt-1 opacity-80">Planeje e realize suas viagens dos sonhos</p>
          </div>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-800 dark:to-blue-950 p-5 rounded-xl text-white shadow-lg flex flex-col justify-between min-h-[120px] border border-blue-400/20 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FaMoneyBillWave className="text-2xl opacity-80" />
            <span className="text-base font-semibold">Entradas Anual</span>
          </div>
          <span className="text-lg font-bold block mb-1">Ano atual: {!showValues ? '•••' : entradasAnual.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          <span className="text-lg font-bold block">Total global: {!showValues ? '•••' : entradasTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-700 dark:from-red-800 dark:to-red-950 p-5 rounded-xl text-white shadow-lg flex flex-col justify-between min-h-[120px] border border-red-400/20 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FaWallet className="text-2xl opacity-80" />
            <span className="text-base font-semibold">Despesas</span>
          </div>
          <span className="text-lg font-bold block mb-1">Ano atual: {!showValues ? '•••' : `€ ${totalDespesasAno.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
          <span className="text-lg font-bold block">Total global: {!showValues ? '•••' : `€ ${totalDespesas.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 dark:from-green-800 dark:to-green-950 p-5 rounded-xl text-white shadow-lg flex flex-col justify-between min-h-[120px] border border-green-400/20 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <FaPiggyBank className="text-2xl opacity-80" />
            <span className="text-base font-semibold">Saldo do Fundo</span>
          </div>
          <span className="text-3xl font-bold">{!showValues ? '•••' : `€ ${saldoFundo.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
          {saldoFundo !== 0 && (
            <span className={`text-xs mt-1 ${saldoFundo >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {saldoFundo >= 0 ? '✅ Disponível' : '⚠️ Negativo'}
            </span>
          )}
        </div>
      </div>

      {/* Adicionar Entrada (Aporte) com acordeão */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-800 dark:to-cyan-800 text-white font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
          onClick={() => setShowEntradaForm(v => !v)}
        >
          <span className="flex items-center gap-3">
            <FaPlusCircle className="text-xl" />
            Adicionar Entrada (Aporte)
          </span>
          <span className="text-xl">{showEntradaForm ? '▲' : '▼'}</span>
        </button>
        {showEntradaForm && (
          <div className="p-6">
            <form className="grid grid-cols-1 gap-4" onSubmit={async e => {
              e.preventDefault();
              if (!userId || !entradaValor) return;
              const valor = Number(entradaValor);
              if (valor <= 0) return;
              const { addViagemEntry } = await import('../services/addViagemEntry');
              await addViagemEntry(userId, valor);
              setEntradaValor('');
              await atualizarTudo();
            }}>
              <input type="number" placeholder="Valor da Entrada (em Euro)" className="input w-full rounded-xl" value={entradaValor} onChange={e => setEntradaValor(e.target.value)} min={0} step={0.01} required />
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1 h-12 rounded-xl text-base">Adicionar Entrada</button>
                <button type="button" className="btn-secondary flex-1 h-12 rounded-xl text-base" onClick={() => setShowEntradaForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Adicionar Despesa com acordeão */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-800 dark:to-pink-900 text-white font-bold text-lg hover:from-red-600 hover:to-pink-700 transition-all"
          onClick={() => setShowDespesaForm(v => !v)}
        >
          <span className="flex items-center gap-3">
            <FaWallet className="text-xl" />
            Adicionar Despesa
          </span>
          <span className="text-xl">{showDespesaForm ? '▲' : '▼'}</span>
        </button>
        {showDespesaForm && (
          <div className="p-6">
            <form className="grid grid-cols-1 gap-4" onSubmit={async e => {
              e.preventDefault();
              if (!userId) return;
              const nomeInput = despesaNome;
              const valorInput = Number(despesaValor);
              const dataInput = despesaData;
              if (!nomeInput || valorInput <= 0 || !dataInput) return;
              const { addViagemExpense } = await import('../services/addViagemExpense');
              await addViagemExpense(userId, nomeInput, valorInput, dataInput);
              setDespesaNome('');
              setDespesaValor('');
              setDespesaData('');
              await atualizarTudo();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Nome da Despesa" className="input w-full rounded-xl" value={despesaNome} onChange={e => setDespesaNome(e.target.value)} required />
                <input type="number" placeholder="Valor (em Euro)" className="input w-full rounded-xl" min={0} step={0.01} value={despesaValor} onChange={e => setDespesaValor(e.target.value)} required />
                <input type="date" className="input w-full rounded-xl" value={despesaData} onChange={e => setDespesaData(e.target.value)} required />
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200">Adicionar Despesa</button>
            </form>
          </div>
        )}
      </div>

      {/* Histórico de Despesas - Acordeão por Ano */}
      <div className="w-full mt-10 px-2 sm:px-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Histórico de Despesas</h2>
        {despesas.length === 0 ? (
          <div className="rounded-lg shadow-sm p-4 text-zinc-500 italic">Nenhuma despesa cadastrada.</div>
        ) : (
          (() => {
            const porAno: Record<string, any[]> = {};
            for (const d of despesas) {
              const ano = new Date(d.data).getFullYear().toString();
              if (!porAno[ano]) porAno[ano] = [];
              porAno[ano].push(d);
            }
            const anos = Object.keys(porAno).sort((a, b) => Number(b) - Number(a));
            const anoAtual = new Date().getFullYear().toString();
            return (
              <div className="space-y-3">
                {anos.map((ano) => (
                  <details key={ano} className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" open={ano === anoAtual}>
                    <summary className="cursor-pointer px-2 sm:px-4 py-3 font-semibold text-base sm:text-lg select-none flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="flex items-center gap-2">
                        Despesas {ano}
                        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </span>
                      <span className="text-xs text-zinc-400">{porAno[ano].length} despesas</span>
                    </summary>
                    <div className="px-2 sm:px-4 pb-4">
                      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                        {porAno[ano]
                          .slice()
                          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                          .map((d, i) => (
                            <li key={d._id || i} className="py-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-900 dark:text-white">{d.nome}</span>
                                <span className="text-xs text-zinc-400">{new Date(d.data).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-red-600">{!showValues ? '•••' : `€ ${Number(d.valor).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
                                <button
                                  className="text-zinc-500 hover:text-red-600 p-1"
                                  title="Excluir despesa"
                                  onClick={async () => {
                                    if (!d._id) return;
                                    if (!confirm('Confirma exclusão desta despesa?')) return;
                                    const { deleteViagemExpense } = await import('../services/deleteViagemExpense');
                                    try {
                                      await deleteViagemExpense(d._id);
                                      await atualizarTudo();
                                    } catch (err) {
                                      console.error('Erro ao excluir despesa', err);
                                      alert('Erro ao excluir despesa');
                                    }
                                  }}
                                ><FaTrash /></button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            );
          })()
        )}
      </div>
    </main>
  );
};

export default Viagem;