import api from './api';

export async function getViagemExpensesTotal(userId: string) {
  const res = await api.get(`/api/viagem-expense/user/${userId}/total`);
  return res.data.total || 0;
}

export async function addViagemExpense(expense: any) {
  const res = await api.post('/api/viagem-expense', expense);
  return res.data;
}
