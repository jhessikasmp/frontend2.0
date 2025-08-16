import axios from 'axios';

export async function getViagemExpenses(userId: string) {
  const res = await axios.get(`/api/viagem-expense/user/${userId}`);
  return res.data.data || [];
}
