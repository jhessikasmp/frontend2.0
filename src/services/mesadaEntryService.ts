import axios from 'axios';

export async function getMesadaEntriesYear(userId: string, year: number) {
  const res = await axios.get(`/api/mesada-entry/year/${userId}/${year}`);
  return res.data.data || [];
}

export async function addMesadaEntry(entry: any) {
  const res = await axios.post('/api/mesada-entry', entry);
  return res.data;
}
