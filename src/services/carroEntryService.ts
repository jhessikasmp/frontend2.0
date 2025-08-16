import axios from 'axios';

export async function getCarroEntriesYear(userId: string, year: number) {
  const res = await axios.get(`/api/carro-entry/year/${userId}/${year}`);
  return res.data.data || [];
}

export async function addCarroEntry(entry: any) {
  const res = await axios.post('/api/carro-entry', entry);
  return res.data;
}
