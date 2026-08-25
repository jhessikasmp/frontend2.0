import React, { useEffect, useState } from 'react';
import { FiDownload, FiCalendar, FiFileText } from 'react-icons/fi';
import { useValueVisibility } from '../context/ValueVisibilityContext';
import { getAllUsers } from '../services/userService';
import { getYearlySummaryByUser } from '../services/getYearlySummaryByUser';
import { getAnnualSalary } from '../services/getAnnualSalary';
import { getAnnualTotalWithEntries } from '../services/getAnnualTotalWithEntries';

const RelatorioAnual: React.FC = () => {
	const { showValues } = useValueVisibility();
	const [users, setUsers] = useState<any[]>([]);
	const [annualData, setAnnualData] = useState<Record<string, { salary: number; expenses: number; saldo: number }>>({});
	const [year, setYear] = useState<number>(new Date().getFullYear());
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	
	// Estados para download de PDF
	const [showCustomReport, setShowCustomReport] = useState<boolean>(false);
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

	useEffect(() => {
	const run = async () => {
			try {
		setLoading(true);
		setError(null);
				const userList = await getAllUsers();
				const usersArray = Array.isArray(userList) ? userList : (userList?.data ?? []);
				setUsers(usersArray);
				if (usersArray.length === 0) return;

				// Tenta consolidado; em caso de erro, calcula via endpoints individuais
				let map = new Map<string, { salary: number; expenses: number; saldo: number }>();
				try {
					const consolidated = await getYearlySummaryByUser(year);
					for (const row of consolidated) {
						const expensesWithEntries = (row.expensesTotal || 0) + (row.entriesTotal || 0);
						map.set(row._id, {
							salary: row.salariesTotal || 0,
							expenses: expensesWithEntries,
							saldo: row.balanceWithEntries ?? ((row.salariesTotal || 0) - expensesWithEntries),
						});
					}
				} catch {
					const [withEntriesByUser, salariesSettled] = await Promise.all([
						getAnnualTotalWithEntries(year),
						Promise.allSettled(usersArray.map(async (u: any) => ({
							userId: u._id,
							total: (await getAnnualSalary(u._id, year)).reduce((s: number, d: any) => s + (d?.value || 0), 0)
						})))
					]);
					const withMap = new Map<string, number>((withEntriesByUser || []).map((e: any) => [e._id, e.total || 0]));
					const salMap = new Map<string, number>();
					for (const r of salariesSettled) if (r.status === 'fulfilled') salMap.set(r.value.userId, r.value.total);
					map = new Map<string, { salary: number; expenses: number; saldo: number }>();
					for (const u of usersArray) {
						const sal = salMap.get(u._id) || 0;
						const exp = withMap.get(u._id) || 0; // despesas + saídas
						map.set(u._id, { salary: sal, expenses: exp, saldo: sal - exp });
					}
				}
				const next: Record<string, { salary: number; expenses: number; saldo: number }> = {};
				for (const u of usersArray) {
					const v = map.get(u._id) || { salary: 0, expenses: 0, saldo: 0 };
					next[u._id] = v;
				}
				setAnnualData(next);
			} catch (err) {
				setError('Não foi possível carregar o relatório.');
			}
			finally { setLoading(false); }
		};
		run();
	}, [year]);

	const handleAnnualDownload = async () => {
		const filename = `relatorio-anual-${year}.pdf`;
		setDownloadLoading(true);
		try {
			let res = await fetch(`${API_URL}/api/reports/annual/download?year=${year}`);
			if (!res.ok && (res.status === 404 || res.status === 405)) {
				res = await fetch(`${API_URL}/api/reports/annual?year=${year}`);
			}
			if (!res.ok && (res.status === 404 || res.status === 405)) {
				res = await fetch(`${API_URL}/api/reports/annual/download`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ year })
				});
			}
			if (!res.ok) {
				throw new Error(`Erro ${res.status}: ${res.statusText}`);
			}
			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Erro no download:', error);
			alert(`Erro ao baixar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
		} finally {
			setDownloadLoading(false);
		}
	};

	const handleCustomPeriodDownload = async () => {
		if (!startDate || !endDate) {
			alert('Por favor, selecione as datas de início e fim');
			return;
		}

		const start = new Date(startDate);
		const end = new Date(endDate);
		
		if (start > end) {
			alert('Data inicial deve ser anterior à data final');
			return;
		}

		const url = `${API_URL}/api/reports/custom-period?startDate=${startDate}&endDate=${endDate}`;
		const filename = `relatorio-periodo-${startDate}-${endDate}.pdf`;

		setDownloadLoading(true);
		try {
			let res = await fetch(url);
			if (!res.ok && (res.status === 404 || res.status === 405)) {
				res = await fetch(`${API_URL}/api/reports/custom-period`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ startDate, endDate })
				});
			}
			if (!res.ok) {
				throw new Error(`Erro ${res.status}: ${res.statusText}`);
			}
			const blob = await res.blob();
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error('Erro no download:', error);
			alert(`Erro ao baixar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
		} finally {
			setDownloadLoading(false);
		}
	};

	const totalGeralSalary = Object.values(annualData).reduce((sum, d) => sum + (d.salary || 0), 0);
	const totalGeralExpenses = Object.values(annualData).reduce((sum, d) => sum + (d.expenses || 0), 0);
	const totalGeralSaldo = Object.values(annualData).reduce((sum, d) => sum + (d.saldo || 0), 0);

	return (
		<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
			{/* Cabeçalho */}
			<div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-indigo-400/20">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-3">
							<FiFileText className="text-3xl" />
							Relatório Anual
						</h1>
						<p className="text-indigo-100 mt-1 opacity-80">Resumo financeiro consolidado do ano</p>
					</div>
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
						<div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2">
							<label htmlFor="year" className="text-sm text-indigo-100">Ano</label>
							<select id="year" className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50" value={year} onChange={e => setYear(Number(e.target.value))}>
								{Array.from({ length: 7 }).map((_, idx) => {
									const y = new Date().getFullYear() - idx;
									return <option key={y} value={y} className="text-gray-900">{y}</option>;
								})}
							</select>
						</div>
						
						<div className="flex gap-2">
							<button
								onClick={handleAnnualDownload}
								disabled={downloadLoading}
								className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-white/20"
							>
								{downloadLoading ? (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								) : (
									<FiDownload className="w-4 h-4" />
								)}
								PDF Anual
							</button>
							
							<button
								onClick={() => setShowCustomReport(!showCustomReport)}
								className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all text-sm border border-white/20"
							>
								<FiCalendar className="w-4 h-4" />
								Período
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Cards totais gerais */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-800 dark:to-blue-950 p-5 rounded-xl text-white shadow-lg border border-blue-400/20">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-base font-semibold opacity-90">Total Salários</span>
					</div>
					<span className="text-2xl font-bold">{!showValues ? '•••' : `€ ${totalGeralSalary.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
				</div>
				<div className="bg-gradient-to-br from-red-500 to-red-700 dark:from-red-800 dark:to-red-950 p-5 rounded-xl text-white shadow-lg border border-red-400/20">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-base font-semibold opacity-90">Total Despesas</span>
					</div>
					<span className="text-2xl font-bold">{!showValues ? '•••' : `€ ${totalGeralExpenses.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
				</div>
				<div className="bg-gradient-to-br from-green-500 to-green-700 dark:from-green-800 dark:to-green-950 p-5 rounded-xl text-white shadow-lg border border-green-400/20">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-base font-semibold opacity-90">Saldo Líquido</span>
					</div>
					<span className={`text-2xl font-bold ${totalGeralSaldo >= 0 ? '' : 'text-red-200'}`}>{!showValues ? '•••' : `€ ${totalGeralSaldo.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
					{totalGeralSaldo !== 0 && (
						<span className={`text-xs mt-1 block ${totalGeralSaldo >= 0 ? 'text-green-200' : 'text-red-200'}`}>
							{totalGeralSaldo >= 0 ? '✅ Superávit' : '⚠️ Déficit'}
						</span>
					)}
				</div>
			</div>

			{/* Seção de relatório personalizado */}
			{showCustomReport && (
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
					<div className="p-6">
						<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
							<FiCalendar className="text-indigo-500" />
							Relatório por Período Específico
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Data de Início
								</label>
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="input w-full rounded-xl"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Data de Fim
								</label>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="input w-full rounded-xl"
								/>
							</div>
						</div>
						<div className="flex gap-2">
							<button
								onClick={handleCustomPeriodDownload}
								disabled={downloadLoading || !startDate || !endDate}
								className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							>
								{downloadLoading ? (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								) : (
									<FiDownload className="w-4 h-4" />
								)}
								Baixar Relatório do Período
							</button>
							<button
								onClick={() => setShowCustomReport(false)}
								className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
							>
								Cancelar
							</button>
						</div>
						<div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
							<p><strong>Exemplo:</strong> Para relatório de 1º agosto a 30 agosto, selecione as datas correspondentes.</p>
							<p>O relatório incluirá salários, despesas, entradas em fundos e total de ativos do período selecionado.</p>
						</div>
					</div>
				</div>
			)}
			
			{loading && (
				<div className="flex justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
				</div>
			)}
			{error && (
				<div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
					{error}
				</div>
			)}
			
			{!loading && !error && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{users.length === 0 ? (
						<div className="col-span-full text-center py-12 text-zinc-500 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
							Nenhum usuário encontrado.
						</div>
					) : users.map(user => {
						const data = annualData[user._id] || { salary: 0, expenses: 0, saldo: 0 };
						return (
							<div key={user._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all">
								<div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 px-6 py-4">
									<h2 className="text-xl font-bold text-white">{user.name}</h2>
								</div>
								<div className="p-6 space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										<div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl text-white shadow">
											<span className="text-xs font-semibold opacity-80 block">Salários</span>
											<span className="text-lg font-bold">{!showValues ? '•••' : `€ ${data.salary.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
										</div>
										<div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl text-white shadow">
											<span className="text-xs font-semibold opacity-80 block">Despesas</span>
											<span className="text-lg font-bold">{!showValues ? '•••' : `€ ${data.expenses.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
										</div>
										<div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl text-white shadow">
											<span className="text-xs font-semibold opacity-80 block">Saldo</span>
											<span className="text-lg font-bold">{!showValues ? '•••' : `€ ${data.saldo.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</main>
	);
};

export default RelatorioAnual;