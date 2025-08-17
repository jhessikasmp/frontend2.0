import axios from 'axios';

export async function getInvestmentEntriesYear(userId: string, year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/investment-entry/user/${userId}`);
  // Filtra apenas as entradas do ano atual
  return res.data.data.filter((entry: any) => new Date(entry.date).getFullYear() === year);
}
