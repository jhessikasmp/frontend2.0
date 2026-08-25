import axios from 'axios';

export async function getViagemExpensesByUserAndYear(userId: string, year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/viagem-expense/year/${userId}/${year}`);
  return res.data.data || [];
}