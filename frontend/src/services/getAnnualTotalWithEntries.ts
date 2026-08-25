import axios from 'axios';

// Busca a soma anual de despesas + entradas de todas as coleções para todos os usuários
export async function getAnnualTotalWithEntries(year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/expense/annual-total-with-entries/${year}`);
  return res.data.data || [];
}
