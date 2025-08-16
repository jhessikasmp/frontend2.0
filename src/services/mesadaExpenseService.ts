import axios from 'axios';

export async function getMesadaExpensesTotal(userId: string) {
  const res = await axios.get(`/api/mesada-expense/user/${userId}/total`);
  return res.data.total || 0;
}

export async function addMesadaExpense(expense: any) {
  const res = await axios.post('/api/mesada-expense', expense);
  return res.data;
}
