import axios from 'axios';

export async function getViagemExpensesYear(year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/viagem-expense/year/${year}`);
  return res.data.data || [];
}