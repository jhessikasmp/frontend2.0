import api from './api';

export async function getViagemExpensesByUserAndYear(userId: string, year: number) {
  const res = await api.get(`/api/viagem-expense/year/${userId}/${year}`);
  return res.data.data || [];
}
