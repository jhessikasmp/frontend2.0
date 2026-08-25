import axios from 'axios';

export async function getAllInvestments(userId: string) {
  const res = await axios.get(`/api/investment/user/${userId}`);
  return res.data.data;
}
