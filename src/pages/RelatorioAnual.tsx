import React, { useEffect, useState } from 'react';
import { FiDownload, FiCalendar } from 'react-icons/fi';
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

	// Função para download de PDF
	const downloadPDF = async (url: string, filename: string) => {
		try {
			setDownloadLoading(true);
			
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Erro ${response.status}: ${response.statusText}`);
			}

			const blob = await response.blob();
			const downloadUrl = window.URL.createObjectURL(blob);
			
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			
			document.body.removeChild(link);
			window.URL.revokeObjectURL(downloadUrl);
			
			console.log(`Download concluído: ${filename}`);
		} catch (error) {
			console.error('Erro no download:', error);
			alert(`Erro ao baixar relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
		} finally {
			setDownloadLoading(false);
		}
	};

	const handleAnnualDownload = () => {
		const url = `${API_URL}/api/reports/annual/download?year=${year}`;
		const filename = `relatorio-anual-${year}.pdf`;
		downloadPDF(url, filename);
	};

	const handleCustomPeriodDownload = () => {
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
		downloadPDF(url, filename);
	};

	return (
		<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatório Anual</h1>
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
					<div className="flex items-center gap-2">
						<label htmlFor="year" className="text-sm text-zinc-600 dark:text-zinc-300">Ano</label>
						<select id="year" className="input h-9 text-sm" value={year} onChange={e => setYear(Number(e.target.value))}>
							{Array.from({ length: 7 }).map((_, idx) => {
								const y = new Date().getFullYear() - idx;
								return <option key={y} value={y}>{y}</option>;
							})}
						</select>
					</div>
					
					{/* Botões de download */}
					<div className="flex gap-2">
						<button
							onClick={handleAnnualDownload}
							disabled={downloadLoading}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
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
							className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
						>
							<FiCalendar className="w-4 h-4" />
							Período Personalizado
						</button>
					</div>
				</div>
			</div>

			{/* Seção de relatório personalizado */}
			{showCustomReport && (
				<div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-700">
					<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Relatório por Período Específico</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Data de Início
							</label>
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
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
								className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:text-white"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							onClick={handleCustomPeriodDownload}
							disabled={downloadLoading || !startDate || !endDate}
							className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
							className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
						>
							Cancelar
						</button>
					</div>
					<div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
						<p><strong>Exemplo:</strong> Para relatório de 1º agosto a 30 agosto, selecione as datas correspondentes.</p>
						<p>O relatório incluirá salários, despesas, entradas em fundos e total de ativos do período selecionado.</p>
					</div>
				</div>
			)}
			
			{loading && <div className="text-sm text-zinc-500">Carregando…</div>}
			{error && <div className="text-sm text-red-500">{error}</div>}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{users.length === 0 ? (
							<div className="text-zinc-500">Nenhum usuário encontrado.</div>
						) : users.map(user => (
					<div key={user._id} className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
						<h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">{user.name}</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 md:p-4 rounded-lg text-white shadow flex flex-col justify-between min-h-[40px] md:min-h-[80px]">
								<span className="text-base md:text-lg font-semibold mb-1 md:mb-2">Salários Anual</span>
								<span className="text-xl md:text-2xl font-bold">{!showValues ? '•••' : `€ ${annualData[user._id]?.salary?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}`}</span>
							</div>
							<div className="bg-gradient-to-r from-red-500 to-red-600 p-2 md:p-4 rounded-lg text-white shadow flex flex-col justify-between min-h-[40px] md:min-h-[80px]">
								<span className="text-base md:text-lg font-semibold mb-1 md:mb-2">Despesas Anual</span>
								<span className="text-xl md:text-2xl font-bold">{!showValues ? '•••' : `€ ${annualData[user._id]?.expenses?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}`}</span>
							</div>
							<div className="bg-gradient-to-r from-green-500 to-green-600 p-2 md:p-4 rounded-lg text-white shadow flex flex-col justify-between min-h-[40px] md:min-h-[80px]">
								<span className="text-base md:text-lg font-semibold mb-1 md:mb-2">Saldo Anual</span>
								<span className="text-xl md:text-2xl font-bold">{!showValues ? '•••' : `€ ${annualData[user._id]?.saldo?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}`}</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Gráfico, título e bloco de debug removidos conforme solicitado */}
		</main>
	);
};

export default RelatorioAnual;
