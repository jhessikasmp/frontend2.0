import axios from 'axios';

export async function deleteEmergencyExpense(id: string) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.delete(`${apiUrl}/api/emergency-expense/${id}`);
  return res.data;
}
