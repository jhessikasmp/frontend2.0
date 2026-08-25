import api from './api';

export async function getAllViagemExpenses() {
  const res = await api.get('/api/viagem-expense/all');
  return res.data.data || [];
}
