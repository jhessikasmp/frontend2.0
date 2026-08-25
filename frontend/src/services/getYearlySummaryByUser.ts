import axios from 'axios';

export interface YearlyUserSummary {
  _id: string;
  salariesTotal: number;
  expensesTotal: number;
  entriesTotal: number;
  balanceOnlyExpenses: number;
  balanceWithEntries: number;
}

export async function getYearlySummaryByUser(year: number): Promise<YearlyUserSummary[]> {
  const apiUrl = import.meta.env.VITE_API_URL;
  const base = apiUrl ? apiUrl.replace(/\/$/, '') : '';
  const url = base ? `${base}/api/summary/year/${year}/by-user` : `/api/summary/year/${year}/by-user`;
  const res = await axios.get(url);
  const payload = res.data;
  return payload?.data ?? [];
}
