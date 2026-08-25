import axios from 'axios';

export async function getTotalInvestmentEntries() {
  const apiUrl = import.meta.env.VITE_API_URL;
  // Usa total convertido para EUR para exibir corretamente no card
  const res = await axios.get(`${apiUrl}/api/investment-entry/total-eur`);
  return res.data.total || 0;
}
