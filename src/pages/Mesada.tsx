import React, { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaWallet, FaPiggyBank } from 'react-icons/fa';
import { getMesadaEntriesYear } from '../services/mesadaEntryService';
import { getMesadaExpensesTotal } from '../services/mesadaExpenseService';

const Mesada: React.FC = () => {
	const [entradasAnual, setEntradasAnual] = useState(0);
	const [totalDespesas, setTotalDespesas] = useState(0);
	const [saldoFundo, setSaldoFundo] = useState(0);
	const [entradaValor, setEntradaValor] = useState('');
	const [despesaNome, setDespesaNome] = useState('');
	const [despesaValor, setDespesaValor] = useState('');
	const [despesaData, setDespesaData] = useState('');
	const [despesas, setDespesas] = useState<any[]>([]);
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

	useEffect(() => {
		if (!userId) return;
		const year = new Date().getFullYear();
		getMesadaEntriesYear(userId, year).then((entries: any[]) => {
			const total = entries.reduce((sum: number, e: any) => sum + (e.valor || 0), 0);
			setEntradasAnual(total);
			setSaldoFundo(total - totalDespesas);
		});
		getMesadaExpensesTotal(userId).then((total: number) => {
			setTotalDespesas(total);
			setSaldoFundo(entradasAnual - total);
		});
		// Buscar histórico de despesas
		import('../services/getMesadaExpenses').then(({ getMesadaExpenses }) => {
			getMesadaExpenses(userId).then((arr: any[]) => setDespesas(arr));
		});
	}, [userId]);

	useEffect(() => {
		setSaldoFundo(entradasAnual - totalDespesas);
	}, [entradasAnual, totalDespesas]);

	return (
		<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
			<h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Fundo de Mesada</h1>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
							<div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 md:p-4 rounded-lg text-white shadow-lg flex flex-col justify-between min-h-[40px] md:min-h-[80px]">
								<div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
									<FaMoneyBillWave className="text-2xl md:text-3xl opacity-80" />
									<span className="text-base md:text-lg font-semibold">Entradas Anual</span>
								</div>
								<span className="text-2xl md:text-3xl font-bold">€ {entradasAnual.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
							</div>
							<div className="bg-gradient-to-r from-red-500 to-red-600 p-2 md:p-4 rounded-lg text-white shadow-lg flex flex-col justify-between min-h-[40px] md:min-h-[80px]">
								<div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
									<FaWallet className="text-2xl md:text-3xl opacity-80" />
									<span className="text-base md:text-lg font-semibold">Total de Despesas</span>
								</div>
								<span className="text-2xl md:text-3xl font-bold">€ {totalDespesas.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
							</div>
							<div className="bg-gradient-to-r from-green-500 to-green-600 p-2 md:p-4 rounded-lg text-white shadow-lg flex flex-col justify-between min-h-[40px] md:min-h-[80px]">
								<div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
									<FaPiggyBank className="text-2xl md:text-3xl opacity-80" />
									<span className="text-base md:text-lg font-semibold">Saldo do Fundo</span>
								</div>
								<span className="text-2xl md:text-3xl font-bold">€ {saldoFundo.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
							</div>
						</div>
			{/* Adicionar Entrada (Aporte) */}
			<div className="card mb-8 w-full rounded-lg shadow-lg p-4 sm:p-6">
				{/* Adicionar Entrada (Aporte) com botão cinza #9da4b0 */}
				{!showEntradaForm ? (
					<button
						className="w-full h-12 rounded-xl text-base font-semibold text-white border border-zinc-300 dark:border-zinc-700 transition"
						style={{ backgroundColor: '#9da4b0' }}
						onClick={() => setShowEntradaForm(true)}
					>Adicionar Entrada (Aporte)</button>
				) : (
					<form className="grid grid-cols-1 gap-4" onSubmit={async e => {
						e.preventDefault();
						if (!userId || !entradaValor) return;
						const valor = Number(entradaValor);
						if (valor <= 0) return;
						const { addMesadaEntry } = await import('../services/addMesadaEntry');
						await addMesadaEntry(userId, valor);
						setEntradaValor('');
						// Atualiza os cards após adicionar
						const year = new Date().getFullYear();
						getMesadaEntriesYear(userId, year).then((entries: any[]) => {
							const total = entries.reduce((sum: number, e: any) => sum + (e.valor || 0), 0);
							setEntradasAnual(total);
						});
						getMesadaExpensesTotal(userId).then((total: number) => {
							setTotalDespesas(total);
						});
								// Atualiza histórico de despesas
								import('../services/getMesadaExpenses').then(({ getMesadaExpenses }) => {
									getMesadaExpenses(userId).then(arr => setDespesas(arr));
								});
					}}>
						<h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Adicionar Entrada (Aporte)</h2>
						<input type="number" placeholder="Valor da Entrada (em Euro)" className="input w-full" value={entradaValor} onChange={e => setEntradaValor(e.target.value)} min={0} step={0.01} required />
						<div className="flex gap-4 mt-2">
							<button type="submit" className="btn-primary flex-1 h-12 rounded-xl text-base">Adicionar Entrada</button>
							<button type="button" className="btn-secondary flex-1 h-12 rounded-xl text-base" onClick={() => setShowEntradaForm(false)}>Cancelar</button>
						</div>
					</form>
				)}
			</div>

			{/* Adicionar Despesa */}
			<div className="card mb-8 w-full rounded-lg shadow-lg p-4 sm:p-6">
				<h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Adicionar Despesa</h2>
				<form className="grid grid-cols-1 gap-4" onSubmit={async e => {
					e.preventDefault();
					if (!userId) return;
					if (!despesaNome || Number(despesaValor) <= 0 || !despesaData) return;
					const { addMesadaExpense } = await import('../services/addMesadaExpense');
					await addMesadaExpense(userId, despesaNome, Number(despesaValor), despesaData);
					// Atualiza os cards após adicionar
					getMesadaExpensesTotal(userId).then((total: number) => {
						setTotalDespesas(total);
					});
					const year = new Date().getFullYear();
					getMesadaEntriesYear(userId, year).then((entries: any[]) => {
						const total = entries.reduce((sum: number, e: any) => sum + (e.valor || 0), 0);
						setEntradasAnual(total);
					});
					// Limpa os campos controlados
					setDespesaNome('');
					setDespesaValor('');
					setDespesaData('');
								// Atualiza histórico de despesas
								import('../services/getMesadaExpenses').then(({ getMesadaExpenses }) => {
									getMesadaExpenses(userId).then(arr => setDespesas(arr));
								});
				}}>
					<input type="text" placeholder="Nome da Despesa" className="input w-full" value={despesaNome} onChange={e => setDespesaNome(e.target.value)} required />
					<input type="number" placeholder="Valor (em Euro)" className="input w-full" min={0} step={0.01} value={despesaValor} onChange={e => setDespesaValor(e.target.value)} required />
					<input type="date" className="input w-full" value={despesaData} onChange={e => setDespesaData(e.target.value)} required />
					<button type="submit" className="btn-primary mt-2 w-full h-14 rounded-xl text-base">Adicionar Despesa</button>
				</form>
			</div>

			{/* Histórico de Despesas - acordeon */}
			<div className="w-full mt-10 px-2 sm:px-0">
				<details className="rounded-lg shadow-sm" open>
					<summary className="cursor-pointer px-2 sm:px-4 py-3 font-semibold text-base sm:text-lg select-none flex items-center justify-between">
						<span className="flex items-center gap-2">
							Histórico de Despesas
							<svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
						</span>
						<span className="text-xs text-zinc-400">{despesas.length} despesas</span>
					</summary>
					<div className="px-2 sm:px-4 pb-4">
						{despesas.length === 0 ? (
							<div className="text-zinc-500 italic">Nenhuma despesa cadastrada.</div>
						) : (
							<ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
								{despesas.map((d, i) => (
									<li key={d._id || i} className="py-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base">
										<span className="font-medium text-gray-900 dark:text-white">{d.nome}</span>
										<span className="text-sm text-red-600">€ {d.valor.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
										<span className="text-xs text-zinc-400 ml-2">{new Date(d.data).toLocaleDateString('pt-BR')}</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</details>
			</div>
		</main>
	);
};

export default Mesada;
