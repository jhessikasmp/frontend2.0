import axios from 'axios';

export async function getTotalExpensesWithEntries() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/expense/total-with-entries`);
  return res.data.total || 0;
}
