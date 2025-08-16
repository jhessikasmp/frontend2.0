import axios from 'axios';

export async function getAnnualExpenses(userId: string, year: number) {
  const res = await axios.get(`/api/expense/user/${userId}/year/${year}`);
  return res.data.data || [];
}
