import axios from 'axios';

export async function getInvestmentEntriesYear(userId: string, year: number) {
  const res = await axios.get(`/api/investment-entry/user/${userId}`);
  // Filtra apenas as entradas do ano atual
  return res.data.data.filter((entry: any) => new Date(entry.date).getFullYear() === year);
}
