import axios from 'axios';

export async function getCarroEntriesYear(userId: string, year: number) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/carro-entry/year/${userId}/${year}`);
  return res.data.data || [];
}

export async function addCarroEntry(entry: any) {
  const res = await axios.post('/api/carro-entry', entry);
  return res.data;
}
