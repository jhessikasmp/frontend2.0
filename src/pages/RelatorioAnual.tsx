import React, { useEffect, useState } from 'react';
import { useValueVisibility } from '../context/ValueVisibilityContext';
import { getAllUsers } from '../services/userService';
import { getAnnualSalary } from '../services/getAnnualSalary';
import { getAllUsersMonthlyExpenses } from '../services/getAllUsersMonthlyExpenses';
// ...existing code...
import { getAnnualTotalWithEntries } from '../services/getAnnualTotalWithEntries';
// ...existing code...
// ...existing code...


const RelatorioAnual: React.FC = () => {
	const { showValues } = useValueVisibility();
	const [users, setUsers] = useState<any[]>([]);
	const [annualData, setAnnualData] = useState<Record<string, { salary: number; expenses: number; saldo: number }>>({});
	const year = new Date().getFullYear();

	useEffect(() => {
		getAllUsers().then((res: any) => {
			const userList = res.data || res;
			setUsers(userList);
			getAnnualTotalWithEntries(year).then((annualExpensesArr: any[]) => {
				userList.forEach((user: any) => {
					Promise.all([
						getAnnualSalary(user._id, year)
					]).then(([salaryArr]) => {
						const salary = salaryArr.reduce((sum: number, s: any) => sum + (s.value || 0), 0);
						const userExpenseObj = annualExpensesArr.find(e => e._id === user._id);
						const expenses = userExpenseObj ? userExpenseObj.total : 0;
						setAnnualData(prev => ({
							...prev,
							[user._id]: {
								salary,
								expenses,
								saldo: salary - expenses
							}
						}));
					});
				});
			});
		});
		getAllUsersMonthlyExpenses().then((data: any[]) => {
			// Filtra apenas o ano atual
			const filtered = data.filter(d => d._id.year === year);
			// Ordena por mês
			filtered.sort((a, b) => a._id.month - b._id.month);
		});
	}, [year]);

	return (
		<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
			<h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Relatório Anual</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{users.map(user => (
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
