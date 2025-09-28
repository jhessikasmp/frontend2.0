import axios from 'axios';

export interface CurrentMonthSummary {
  salariesTotal: number;
  expensesTotal: number;
  entriesTotal: number;
  balanceOnlyExpenses: number;
  balanceWithEntries: number;
  period: { from: string; to: string };
}

export async function getCurrentMonthSummary(): Promise<CurrentMonthSummary | null> {
  const apiUrl = import.meta.env.VITE_API_URL;
  try {
    const res = await axios.get(`${apiUrl}/api/summary/current-month`);
    if (res.data?.success) {
      return res.data.data as CurrentMonthSummary;
    }
    return null;
  } catch {
    return null;
  }
}
