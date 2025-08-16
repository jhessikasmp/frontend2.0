import axios from 'axios';

export async function getViagemExpensesTotal(userId: string) {
  const res = await axios.get(`/api/viagem-expense/user/${userId}/total`);
  return res.data.total || 0;
}

export async function addViagemExpense(expense: any) {
  const res = await axios.post('/api/viagem-expense', expense);
  return res.data;
}
