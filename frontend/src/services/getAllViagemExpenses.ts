import axios from 'axios';

export async function getAllViagemExpenses() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/viagem-expense/all`);
  return res.data.data || [];
}
