import axios from 'axios';

export async function getAllInvestments() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const base = apiUrl ? apiUrl.replace(/\/$/, '') : '';
  const url = base ? `${base}/api/investment/all` : '/api/investment/all';
  const res = await axios.get(url);
  return res.data.data || [];
}
