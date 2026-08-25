import api from './api';

export async function getViagemExpensesYear(year: number) {
  const res = await api.get(`/api/viagem-expense/year/${year}`);
  return res.data.data || [];
}
