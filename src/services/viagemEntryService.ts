import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export async function getViagemEntriesYear(userId: string, year: number) {
  let url;
  if (!userId) {
    url = `${apiUrl}/api/viagem-entry/year/${year}`;
  } else {
    url = `${apiUrl}/api/viagem-entry/year/${userId}/${year}`;
  }
  const res = await axios.get(url);
  return res.data.data || [];
}

export async function addViagemEntry(entry: any) {
  const res = await axios.post(`${apiUrl}/api/viagem-entry`, entry);
  return res.data;
}
