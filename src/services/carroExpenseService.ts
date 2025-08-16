import axios from 'axios';

export async function getCarroExpensesTotal(userId: string) {
  const res = await axios.get(`/api/carro-expense/user/${userId}/total`);
  return res.data.total || 0;
}

export async function addCarroExpense(expense: any) {
  const res = await axios.post('/api/carro-expense', expense);
  return res.data;
}
