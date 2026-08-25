import axios from 'axios';

export async function deleteViagemExpense(id: string) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.delete(`${apiUrl}/api/viagem-expense/${id}`);
  return res.data;
}
