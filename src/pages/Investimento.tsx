import React, { useEffect, useState } from 'react';
import { useValueVisibility } from '../context/ValueVisibilityContext';
import { FaPiggyBank, FaEuroSign, FaChartLine, FaPercentage, FaDollarSign, FaMoneyBillWave } from 'react-icons/fa';
import { getInvestmentEntriesYear } from '../services/investmentEntryService';
import { getTotalInvestmentEntries } from '../services/getTotalInvestmentEntries';
import { getAllInvestments } from '../services/getAllInvestments';
import { toEuro, toBRL, toGBP } from '../utils/currency';
import { addInvestmentEntry } from '../services/addInvestmentEntry';

const cardBase =
	'flex flex-col justify-between rounded-lg shadow-lg border border-white/30 hover:border-primary-400 transition-all duration-200 p-2 md:p-4 min-h-[40px] md:min-h-[48px] text-white cursor-pointer';
const cardGradients = [
	'bg-gradient-to-r from-blue-500 to-blue-600',
	'bg-gradient-to-r from-green-500 to-green-600',
	'bg-gradient-to-r from-yellow-500 to-yellow-600',
];

const Investimento: React.FC = () => {
	const { showValues } = useValueVisibility();
	const [entradasAnoEuro, setEntradasAnoEuro] = useState(0);
	const [entradasTotal, setEntradasTotal] = useState(0);
	const [totalAtivosEuro, setTotalAtivosEuro] = useState(0);
	const [totalAtivosBRL, setTotalAtivosBRL] = useState(0);
	const [totalAtivosGBP, setTotalAtivosGBP] = useState(0);
	const [entradaValor, setEntradaValor] = useState('');
	const [entradaMoeda, setEntradaMoeda] = useState('Euro');
	const [ativos, setAtivos] = useState<any[]>([]);
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

	const atualizarDados = () => {
		const year = new Date().getFullYear();
		getInvestmentEntriesYear(year).then(entries => {
			const totalEuro = entries.reduce((sum: number, e: any) => sum + toEuro(e.value, e.moeda), 0);
			setEntradasAnoEuro(totalEuro);
		});
		getTotalInvestmentEntries().then(total => {
			setEntradasTotal(total);
		});
		getAllInvestments().then(investments => {
			setAtivos(investments || []);
			const totalEuro = (investments || []).reduce((sum: number, inv: any) => {
				const val = Number(inv?.valor) || 0;
				const cur = String(inv?.moeda || '');
				return sum + toEuro(val, cur);
			}, 0);
			setTotalAtivosEuro(totalEuro);
			const totalBrl = (investments || []).reduce((sum: number, inv: any) => {
				const val = Number(inv?.valor) || 0;
				const cur = String(inv?.moeda || '');
				return sum + toBRL(val, cur);
			}, 0);
			setTotalAtivosBRL(totalBrl);
			const totalGbp = (investments || []).reduce((sum: number, inv: any) => {
				const val = Number(inv?.valor) || 0;
				const cur = String(inv?.moeda || '');
				return sum + toGBP(val, cur);
			}, 0);
			setTotalAtivosGBP(totalGbp);
		});
	};

	useEffect(() => {
		atualizarDados();
		// eslint-disable-next-line
	}, []);

	const handleAddEntrada = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userId || !entradaValor) return;
		await addInvestmentEntry(userId, Number(entradaValor), entradaMoeda);
		setEntradaValor('');
		atualizarDados();
	};

	return (
		<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
			<h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Investimentos</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
				<div className={`${cardBase} ${cardGradients[0]}`}> 
					<div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
						<FaEuroSign className="text-2xl md:text-3xl opacity-80" />
						<span className="text-base md:text-lg font-semibold">Entradas Anual</span>
					</div>
					<span className="text-lg md:text-xl font-semibold block mb-1">Ano atual: {!showValues ? '•••' : entradasAnoEuro.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
					<span className="text-lg md:text-xl font-semibold block">Total global: {!showValues ? '•••' : entradasTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
				</div>
				<div className={`${cardBase} ${cardGradients[1]}`}> 
					<div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
						<FaPiggyBank className="text-2xl md:text-3xl opacity-80" />
						<span className="text-base md:text-lg font-semibold">Total de Ativos</span>
					</div>
					<span className="text-2xl md:text-3xl font-bold">{!showValues ? '•••' : totalAtivosEuro.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
					<span className="block text-xs mt-1 md:mt-2 text-white/80">
						{!showValues ? '' : totalAtivosEuro > 0 && (
							<span className="flex flex-col gap-0.5">
								<span>EUR: {totalAtivosEuro.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
								<span>BRL: {totalAtivosBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
								<span>GBP: {totalAtivosGBP.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}</span>
							</span>
						)}
					</span>
				</div>
				<div className={`${cardBase} ${cardGradients[2]}`}> 
					<div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
						<FaChartLine className="text-2xl md:text-3xl opacity-80" />
						<span className="text-base md:text-lg font-semibold">{(totalAtivosEuro - entradasTotal) >= 0 ? 'Lucro' : 'Prejuízo'}</span>
					</div>
					<span className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200">{!showValues ? '•••' : Math.abs(entradasTotal - totalAtivosEuro).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
				</div>
			</div>

			{/* Botão para mostrar formulário de entrada */}
			<div className="card mb-8 w-full rounded-lg shadow-lg p-4 sm:p-6 mt-8">
				{!showEntradaForm ? (
					<button
						className="w-full h-12 rounded-xl text-base font-semibold text-white border border-zinc-300 dark:border-zinc-700 transition"
						style={{ backgroundColor: '#9da4b0' }}
						onClick={() => setShowEntradaForm(true)}
					>Adicionar Entrada (Aporte)</button>
				) : (
					<>
						<h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Adicionar Entrada (Aporte)</h2>
						<form className="grid grid-cols-1 gap-4" onSubmit={handleAddEntrada}>
							<div className="flex gap-2">
								<input type="number" placeholder="Valor da Entrada" className="input flex-1" value={entradaValor} onChange={e => setEntradaValor(e.target.value)} min={0} step={0.01} required />
								<select className="input w-40" value={entradaMoeda} onChange={e => setEntradaMoeda(e.target.value)}>
									<option value="Euro">Euro (€)</option>
									<option value="Dolar">Dólar ($)</option>
									<option value="Real">Real (R$)</option>
									<option value="Libra">Libra (£)</option>
								</select>
							</div>
							<div className="flex gap-4 mt-2">
								<button type="submit" className="btn-primary flex-1 h-12 rounded-xl text-base">Adicionar Entrada</button>
								<button type="button" className="btn-secondary flex-1 h-12 rounded-xl text-base" onClick={() => setShowEntradaForm(false)}>Cancelar</button>
							</div>
						</form>
					</>
				)}
			</div>

			{/* Acordeão de investimentos por categoria */}
			<div className="w-full mt-10 px-2 sm:px-0">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Investimentos por Categoria</h2>
				<div className="space-y-4">
					{[
						{ label: 'ETF', value: 'ETF' },
						{ label: 'Fundos', value: 'Fundos' },
						{ label: 'Cryptomoedas', value: 'Cryptomoedas' },
						{ label: 'Renda Fixa', value: 'Renda Fixa' },
						{ label: 'Ações', value: 'Acoes' },
					].map((cat, idx) => {
						const ativosCat = ativos.filter(a => {
							if (cat.value === 'Acoes') {
								return a.tipo === 'Acoes' || a.tipo === 'Ações';
							}
							return a.tipo === cat.value;
						});
						const totalCatEuro = ativosCat.reduce((sum, a) => sum + toEuro(a.valor, a.moeda), 0);
						return (
							<details key={cat.label} className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" open={idx === 0}>
								<summary className="cursor-pointer px-2 sm:px-4 py-3 font-semibold text-base sm:text-lg select-none flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<span className="flex items-center gap-2">
										{cat.label === 'ETF' && <FaChartLine className="text-green-500" />}
										{cat.label === 'Fundos' && <FaMoneyBillWave className="text-blue-500" />}
										{cat.label === 'Cryptomoedas' && <FaEuroSign className="text-orange-500" />}
										{cat.label === 'Renda Fixa' && <FaPercentage className="text-purple-500" />}
										{cat.label === 'Ações' && <FaDollarSign className="text-red-500" />}
										{cat.label}
										<span className="text-xs text-zinc-400 font-normal">({ativosCat.length} ativos)</span>
									</span>
									<span className="text-sm font-bold text-green-700 dark:text-green-300">
										{!showValues ? '•••' : totalCatEuro.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
									</span>
								</summary>
								<div className="px-2 sm:px-4 pb-4">
									{ativosCat.length === 0 ? (
										<div className="text-zinc-500 italic py-4 text-center">Nenhum ativo cadastrado nesta categoria.</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full text-sm">
												<thead>
													<tr className="border-b border-gray-200 dark:border-gray-700 text-left text-zinc-500 dark:text-zinc-400">
														<th className="py-2 px-2 font-medium">Ativo</th>
														<th className="py-2 px-2 font-medium text-right">Valor Original</th>
														<th className="py-2 px-2 font-medium text-right">Moeda</th>
														<th className="py-2 px-2 font-medium text-right">Valor em EUR</th>
														<th className="py-2 px-2 font-medium text-right">Data</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-gray-100 dark:divide-gray-700">
													{ativosCat.map((a, i) => {
														const moedaSymbol = a.moeda === 'Euro' ? '€' : a.moeda === 'Dolar' ? '$' : a.moeda === 'Libra' ? '£' : 'R$';
														return (
															<tr key={a._id || i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
																<td className="py-2 px-2 font-medium text-gray-900 dark:text-white">{a.nome}</td>
																<td className="py-2 px-2 text-right">{a.valor.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
																<td className="py-2 px-2 text-right">{moedaSymbol} {a.moeda}</td>
																<td className="py-2 px-2 text-right text-green-700 dark:text-green-300 font-medium">
																	{!showValues ? '•••' : toEuro(a.valor, a.moeda).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
																</td>
																<td className="py-2 px-2 text-right text-zinc-500">{new Date(a.data).toLocaleDateString('pt-BR')}</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									)}
								</div>
							</details>
						);
					})}
				</div>
			</div>
		</main>
	);
};

export default Investimento;