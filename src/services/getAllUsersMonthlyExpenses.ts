import axios from 'axios';

export async function getAllUsersMonthlyExpenses() {
  const res = await axios.get('/api/expense/monthly-total');
  return res.data.data || [];
}
