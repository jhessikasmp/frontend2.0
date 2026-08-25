import axios from 'axios';

export interface InvestmentAnnualReturn {
  _id?: string;
  year: number;
  percent: number;
}

const baseUrl = (() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const base = apiUrl ? apiUrl.replace(/\/$/, '') : '';
  return base ? `${base}/api/investment-returns` : '/api/investment-returns';
})();

export async function listInvestmentReturns(): Promise<InvestmentAnnualReturn[]> {
  const res = await axios.get(baseUrl);
  const payload = res.data;
  return payload?.data ?? [];
}

export async function upsertInvestmentReturn(year: number, percent: number): Promise<InvestmentAnnualReturn> {
  const res = await axios.put(`${baseUrl}/${year}`, { percent });
  const payload = res.data;
  return payload?.data ?? payload;
}

export async function deleteInvestmentReturn(year: number): Promise<void> {
  await axios.delete(`${baseUrl}/${year}`);
}
