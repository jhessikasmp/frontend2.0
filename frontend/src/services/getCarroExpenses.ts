import axios from 'axios';

export async function getCarroExpenses(userId: string) {
  const res = await axios.get(`/api/carro-expense/user/${userId}`);
  return res.data.data || [];
}
