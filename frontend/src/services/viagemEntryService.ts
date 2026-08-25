import api from './api';

export async function getViagemEntriesYear(userId: string, year: number) {
  let url;
  if (!userId) {
    url = `/api/viagem-entry/year/${year}`;
  } else {
    url = `/api/viagem-entry/year/${userId}/${year}`;
  }
  const res = await api.get(url);
  return res.data.data || [];
}

export async function addViagemEntry(entry: any) {
  const res = await api.post('/api/viagem-entry', entry);
  return res.data;
}
