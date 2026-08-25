import axios from 'axios';

// Busca a soma anual de despesas para todos os usuários
export async function getAnnualExpenses(year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/expense/annual-by-user/${year}`);
  return res.data.data || [];
}
