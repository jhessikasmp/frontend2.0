import axios from 'axios';

export async function getMesadaExpenses(userId: string) {
  const res = await axios.get(`/api/mesada-expense/user/${userId}`);
  return res.data.data || [];
}
