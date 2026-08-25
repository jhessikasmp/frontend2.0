import axios from 'axios';

export async function getInvestmentEntriesYear(year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/investment-entry/year/${year}`);
  return res.data.data;
}
