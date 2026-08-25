import api from './api';

export async function getViagemExpenses(userId: string) {
  const res = await api.get(`/api/viagem-expense/user/${userId}`);
  return res.data.data || [];
}
