
import React, { useState, useEffect } from 'react';
import { FaWallet } from 'react-icons/fa';
import { safeGetFromStorage } from '../utils/storage';


const categorias = [
	'Supermercado',
	'Aluguel',
	'Combustível',
	'Boletos',
	'Saúde',
	'Educação',
	'Lazer',
	'Doação',
	'Internet',
	'Streaming',
	'Telefone',
	'Outros'
];

interface Despesa {
	nome: string;
	valor: number;
	categoria: string;
	data: string;
	descricao?: string;
	usuario?: string;
}

const Despesas: React.FC = () => {
	const [form, setForm] = useState({ nome: '', valor: '', categoria: '', data: '', descricao: '' });
	const [despesas, setDespesas] = useState<Despesa[]>([]);
	const [groupedPrevious, setGroupedPrevious] = useState<Record<string, Despesa[]>>({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showCurrent, setShowCurrent] = useState(true);
	const [showPrevious, setShowPrevious] = useState(false);
	const [totalMes, setTotalMes] = useState(0);

	const fetchAllDespesas = async () => {
		try {
			const res = await fetch('/api/expense/all');
			const data = await res.json();
			if (data.success && Array.isArray(data.data)) {
				const despesasArr = data.data.map((d: any): Despesa => ({
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
			console.error('Erro ao buscar despesas:', err);
		}
	};

	useEffect(() => {
		fetchAllDespesas();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('handleSubmit chamado', form);
		setError('');
		setSuccess('');
		if (!form.nome || !form.valor || !form.categoria || !form.data) {
			console.log('Formulário incompleto, submit bloqueado');
			setError('Preencha todos os campos obrigatórios.');
			return;
		}
		setLoading(true);
		try {
			const currentUser = safeGetFromStorage('currentUser', {});
			
			let res;
			try {
				res = await fetch('/api/expense', {
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
			} catch (fetchErr) {
				setError('Não foi possível conectar ao servidor. Verifique sua conexão ou se o backend está rodando.');
				console.error('Erro de rede/fetch:', fetchErr);
				setLoading(false);
				return;
			}
			const contentType = res.headers.get('content-type');
			let data;
			if (contentType && contentType.includes('application/json')) {
				try {
					data = await res.json();
				} catch (err) {
					const text = await res.text();
					setError('Resposta inválida do servidor. Detalhe: ' + text);
					console.error('Resposta inválida do servidor:', text);
					setLoading(false);
					return;
				}
			} else {
				const text = await res.text();
				setError('O servidor retornou um formato inesperado. Detalhe: ' + text + '\nStatus: ' + res.status + '\nHeaders: ' + JSON.stringify(Object.fromEntries(res.headers.entries())));
				console.error('Resposta inesperada do servidor:', text, res);
				setLoading(false);
				return;
			}
			if (data && data.success) {
				setSuccess('Despesa adicionada com sucesso!');
				setForm({ nome: '', valor: '', categoria: '', data: '', descricao: '' });
				fetchAllDespesas();
			} else {
				setError((data && data.message) || 'Erro ao adicionar despesa');
				console.error('Erro backend:', data);
			}
		} catch (err) {
			setError('Erro inesperado no frontend. Detalhe: ' + (err instanceof Error ? err.message : String(err)));
			console.error('Erro inesperado no frontend:', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<div className="bg-gradient-to-r from-red-500 to-red-600 p-3 md:p-6 rounded-lg text-white shadow-lg flex flex-col justify-between min-h-[60px] md:min-h-[100px]">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="flex items-center text-sm md:text-base font-semibold"><FaWallet className="mr-2"/> Total de Despesas do Mês</h3>
							<p className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold">€ {totalMes.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
						</div>
					</div>
				</div>
				<div className="md:col-span-2 flex flex-col justify-center hidden md:block">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Despesas</h2>
					<p className="text-gray-600 dark:text-gray-300">Gerencie e visualize suas despesas mensais de forma clara e rápida.</p>
				</div>
			</div>
			<div className="card mb-8">
				<h2 className="text-lg font-semibold mb-4">Adicionar Despesa</h2>
				<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<input name="nome" value={form.nome} onChange={handleChange} className="input w-full" placeholder="Nome da despesa" required />
					<input name="valor" value={form.valor} onChange={handleChange} className="input w-full" placeholder="Valor (em Euro)" type="number" min="0" step="0.01" required />
					<select name="categoria" value={form.categoria} onChange={handleChange} className="input w-full" required>
						<option value="">Selecione a categoria</option>
						{categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
					</select>
					<input name="data" value={form.data} onChange={handleChange} className="input w-full" placeholder="Data" type="date" required />
					<textarea name="descricao" value={form.descricao} onChange={handleChange} className="input w-full md:col-span-2" placeholder="Descrição (opcional)" />
					<div className="md:col-span-2 flex gap-4 mt-2">
						<button type="submit" className="btn-primary flex-1 h-14 rounded-xl text-base" disabled={loading} onClick={() => console.log('Botão Adicionar clicado, loading:', loading)}>{loading ? 'Adicionando...' : 'Adicionar Despesa'}</button>
					</div>
					{error && <div className="text-red-600 text-sm mt-2 md:col-span-2">{error}</div>}
					{success && <div className="text-green-600 text-sm mt-2 md:col-span-2">{success}</div>}
				</form>
			</div>
			<div className="mt-8">
				<button
					className="w-full flex items-center justify-between p-4 bg-blue-100 dark:bg-blue-900 rounded-lg text-left font-semibold text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
					onClick={() => setShowCurrent(v => !v)}
				>
					Despesas do Mês Atual
					<span>{showCurrent ? '▲' : '▼'}</span>
				</button>
				{showCurrent && (
					<div className="mt-2">
						{despesas.filter(d => {
							const now = new Date();
							const m = now.getMonth();
							const y = now.getFullYear();
							// Garante que d.data está em formato ISO ou Date
							let dateObj;
							if (typeof d.data === 'string' && d.data.length === 10 && d.data.includes('-')) {
								// yyyy-mm-dd
								const [year, month] = d.data.split('-');
								dateObj = { year: Number(year), month: Number(month) - 1 };
							} else {
								const jsDate = new Date(d.data);
								dateObj = { year: jsDate.getFullYear(), month: jsDate.getMonth() };
							}
							return dateObj.year === y && dateObj.month === m;
						}).length === 0 && (
							<div className="text-gray-500 text-sm text-center">Nenhuma despesa lançada neste mês</div>
						)}
						<ul className="space-y-2">
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
								<li key={i} className="bg-gray-50 dark:bg-gray-700 rounded p-3 flex justify-between items-center">
									<div>
										<div className="font-medium">{d.nome}</div>
										<div className="text-xs text-gray-500">{d.categoria} | {d.data} | <span className="text-blue-600">{d.usuario}</span></div>
										{d.descricao && <div className="text-xs text-gray-400 mt-1">{d.descricao}</div>}
									</div>
									<div className="font-bold text-red-600">€ {d.valor.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
			<div className="mt-8">
				<button
					className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
					onClick={() => setShowPrevious(v => !v)}
				>
					Meses Anteriores
					<span>{showPrevious ? '▲' : '▼'}</span>
				</button>
				{showPrevious && (
					<div className="mt-2 space-y-4">
						{Object.keys(groupedPrevious).length === 0 && (
							<div className="text-gray-500 text-sm text-center">Nenhuma despesa de meses anteriores</div>
						)}
						{Object.entries(groupedPrevious).sort((a, b) => b[0].localeCompare(a[0])).map(([month, list]) => (
							<div key={month} className="border rounded-lg p-3 bg-white dark:bg-gray-800">
								<div className="font-semibold mb-2">{new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
								<ul className="space-y-1">
									{list.map((d, i) => (
										<li key={i} className="flex justify-between items-center">
											<div>
												<div className="font-medium">{d.nome}</div>
												<div className="text-xs text-gray-500">{d.categoria} | {d.data} | <span className="text-blue-600">{d.usuario}</span></div>
												{d.descricao && <div className="text-xs text-gray-400 mt-1">{d.descricao}</div>}
											</div>
											<div className="font-bold text-red-600">€ {d.valor.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				)}
			</div>
		</main>
	);
};

export default Despesas;