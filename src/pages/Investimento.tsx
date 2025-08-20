
import React, { useEffect, useState } from 'react';
import { FaPiggyBank, FaEuroSign, FaChartLine } from 'react-icons/fa';
import { getInvestmentEntriesYear } from '../services/investmentEntryService';
import { getAllInvestments } from '../services/getAllInvestments';
import { toEuro } from '../utils/currency';
import { addInvestmentEntry } from '../services/addInvestmentEntry';
import { addInvestment } from '../services/addInvestment';


const cardBase =
	'flex flex-col justify-between rounded-lg shadow-lg border border-white/30 hover:border-primary-400 transition-all duration-200 p-2 md:p-4 min-h-[40px] md:min-h-[48px] text-white cursor-pointer';
const cardGradients = [
	'bg-gradient-to-r from-blue-500 to-blue-600', // Entradas Anual
	'bg-gradient-to-r from-green-500 to-green-600', // Total de Ativos
	'bg-gradient-to-r from-yellow-500 to-yellow-600', // Lucro / Prejuízo
];

const Investimento: React.FC = () => {
		const [entradasAnoEuro, setEntradasAnoEuro] = useState(0);
		const [totalAtivosEuro, setTotalAtivosEuro] = useState(0);
		const [entradaValor, setEntradaValor] = useState('');
		const [ativoNome, setAtivoNome] = useState('');
		const [ativoValor, setAtivoValor] = useState('');
		const [ativoTipo, setAtivoTipo] = useState('');
		const [ativoMoeda, setAtivoMoeda] = useState('');
		const [ativoData, setAtivoData] = useState('');
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
							console.log('Entradas Anual:', entries);
							const totalEuro = entries.reduce((sum: number, e: any) => sum + toEuro(e.value, e.moeda), 0);
							console.log('Total Euro:', totalEuro);
							setEntradasAnoEuro(totalEuro);
						});
			getAllInvestments().then(investments => {
				setAtivos(investments);
				let brl = 0, usd = 0, eur = 0;
				investments.forEach((inv: any) => {
					if (inv.moeda === 'Real') brl += inv.valor;
					else if (inv.moeda === 'Dolar') usd += inv.valor;
					else if (inv.moeda === 'Euro') eur += inv.valor;
				});
				const totalEuro = investments.reduce((sum: number, inv: any) => sum + toEuro(inv.valor, inv.moeda), 0);
				setTotalAtivosEuro(totalEuro);
			});
		};

	useEffect(() => {
		atualizarDados();
		// eslint-disable-next-line
	}, []);

	const handleAddEntrada = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userId || !entradaValor) return;
		await addInvestmentEntry(userId, Number(entradaValor), 'Euro');
		setEntradaValor('');
		atualizarDados();
	// Atualiza histórico de investimentos
	getAllInvestments().then(investments => setAtivos(investments));
	};
		const handleAddAtivo = async (e: React.FormEvent) => {
			e.preventDefault();
			if (!userId || !ativoNome || !ativoValor || !ativoTipo || !ativoMoeda || !ativoData) return;
			await addInvestment({
				user: userId,
				nome: ativoNome,
				valor: Number(ativoValor),
				tipo: ativoTipo,
				moeda: ativoMoeda,
				data: ativoData
			});
			setAtivoNome('');
			setAtivoValor('');
			setAtivoTipo('');
			setAtivoMoeda('');
			setAtivoData('');
			atualizarDados();
	// Atualiza histórico de investimentos
	getAllInvestments().then(investments => setAtivos(investments));
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
									<span className="text-2xl md:text-3xl font-bold">{entradasAnoEuro.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
								</div>
								<div className={`${cardBase} ${cardGradients[1]}`}> 
									<div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
										<FaPiggyBank className="text-2xl md:text-3xl opacity-80" />
										<span className="text-base md:text-lg font-semibold">Total de Ativos</span>
									</div>
									<span className="text-2xl md:text-3xl font-bold">{totalAtivosEuro.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
									<span className="block text-xs mt-1 md:mt-2 text-white/80">{totalAtivosEuro > 0 && <span>Total em EUR: {totalAtivosEuro.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>}</span>
								</div>
								<div className={`${cardBase} ${cardGradients[2]}`}> 
									<div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
										<FaChartLine className="text-2xl md:text-3xl opacity-80" />
										<span className="text-base md:text-lg font-semibold">Lucro / Prejuízo</span>
									</div>
									<span className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200">{(entradasAnoEuro - totalAtivosEuro).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
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
																<input type="number" placeholder="Valor da Entrada (em Euro)" className="input w-full" value={entradaValor} onChange={e => setEntradaValor(e.target.value)} min={0} step={0.01} required />
																<div className="flex gap-4 mt-2">
																	<button type="submit" className="btn-primary flex-1 h-12 rounded-xl text-base">Adicionar Entrada</button>
																	<button type="button" className="btn-secondary flex-1 h-12 rounded-xl text-base" onClick={() => setShowEntradaForm(false)}>Cancelar</button>
																</div>
															</form>
														</>
													)}
												</div>

									{/* Formulário para adicionar novo investimento */}
									<div className="card mb-8 w-full rounded-lg shadow-lg p-4 sm:p-6 mt-8">
										<h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Adicionar Investimento</h2>
									<form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleAddAtivo}>
											<input type="text" placeholder="Nome do Ativo" className="input w-full" value={ativoNome} onChange={e => setAtivoNome(e.target.value)} required />
											<input type="number" placeholder="Valor" className="input w-full" value={ativoValor} onChange={e => setAtivoValor(e.target.value)} min={0} step={0.01} required />
											<select className="input w-full" value={ativoTipo} onChange={e => setAtivoTipo(e.target.value)} required>
												<option value="">Tipo</option>
												<option value="ETF">ETF</option>
												<option value="Cryptomoedas">Cryptomoedas</option>
												<option value="Fundos">Fundos</option>
												<option value="Renda Fixa">Renda Fixa</option>
												<option value="Acoes">Ações</option>
											</select>
											<select className="input w-full" value={ativoMoeda} onChange={e => setAtivoMoeda(e.target.value)} required>
												<option value="">Moeda</option>
												<option value="Real">Real</option>
												<option value="Dolar">Dólar</option>
												<option value="Euro">Euro</option>
											</select>
											<input type="date" className="input w-full md:col-span-2" value={ativoData} onChange={e => setAtivoData(e.target.value)} required />
											<button type="submit" className="btn-primary md:col-span-2 mt-2 w-full h-14 rounded-xl text-base">Adicionar</button>
										</form>
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
									const ativosCat = ativos.filter(a => a.tipo === cat.value);
									return (
										<details key={cat.label} className="rounded-lg shadow-sm" open={idx === 0}>
											<summary className="cursor-pointer px-2 sm:px-4 py-3 font-semibold text-base sm:text-lg select-none flex items-center justify-between">
												<span className="flex items-center gap-2">
													{cat.label}
													<svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
												</span>
												<span className="text-xs text-zinc-400">{ativosCat.length} ativos</span>
											</summary>
											<div className="px-2 sm:px-4 pb-4">
												{ativosCat.length === 0 ? (
													<div className="text-zinc-500 italic">Nenhum ativo cadastrado.</div>
												) : (
													<ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
														{ativosCat.map((a, i) => (
															<li key={a._id || i} className="py-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base">
																<span className="font-medium text-gray-900 dark:text-white">{a.nome}</span>
																<span className="text-sm text-green-700 dark:text-green-300">{toEuro(a.valor, a.moeda).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
																<span className="text-xs text-zinc-400 ml-2">{a.moeda}</span>
																<span className="text-xs text-zinc-400 ml-2">{new Date(a.data).toLocaleDateString('pt-BR')}</span>
															</li>
														))}
													</ul>
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
