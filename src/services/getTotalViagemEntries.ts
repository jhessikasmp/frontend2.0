import axios from 'axios';

export async function getTotalViagemEntries() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/viagem-entry/total`);
  return res.data.total || 0;
}
