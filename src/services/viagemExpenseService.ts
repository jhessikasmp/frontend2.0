import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export async function getViagemExpensesTotal(userId: string) {
  const res = await axios.get(`${apiUrl}/api/viagem-expense/user/${userId}/total`);
  return res.data.total || 0;
}

export async function addViagemExpense(expense: any) {
  const res = await axios.post(`${apiUrl}/api/viagem-expense`, expense);
  return res.data;
}
