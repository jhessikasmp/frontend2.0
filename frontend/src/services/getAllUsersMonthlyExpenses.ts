import axios from 'axios';

export async function getAllUsersMonthlyExpenses() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/expense/monthly-total`);
  return res.data.data || [];
}
