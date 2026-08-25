import axios from 'axios';

export async function getTotalCarroEntries(userId: string) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/carro-entry/total/${userId}`);
  return res.data.total || 0;
}
