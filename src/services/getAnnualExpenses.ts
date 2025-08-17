import axios from 'axios';

export async function getAnnualExpenses(userId: string, year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/expense/user/${userId}/year/${year}`);
  return res.data.data || [];
}
