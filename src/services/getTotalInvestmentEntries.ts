import axios from 'axios';

export async function getTotalInvestmentEntries() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/investment-entry/total`);
  return res.data.total || 0;
}
