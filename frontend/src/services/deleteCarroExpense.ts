import axios from 'axios';

export async function deleteCarroExpense(id: string) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.delete(`${apiUrl}/api/carro-expense/${id}`);
  return res.data;
}
