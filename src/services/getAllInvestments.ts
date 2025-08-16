import axios from 'axios';

export async function getAllInvestments() {
  const res = await axios.get('/api/investment/all');
  return res.data.data || [];
}
