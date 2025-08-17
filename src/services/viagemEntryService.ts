import axios from 'axios';

export async function getViagemEntriesYear(userId: string, year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/viagem-entry/year/${userId}/${year}`);
  return res.data.data || [];
}

export async function addViagemEntry(entry: any) {
  const res = await axios.post('/api/viagem-entry', entry);
  return res.data;
}
