import axios from 'axios';

export async function deleteExpense(id: string) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.delete(`${apiUrl}/api/expense/${id}`);
  return res.data;
}
