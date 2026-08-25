import api from './api';

export async function getTotalViagemEntries() {
  const res = await api.get('/api/viagem-entry/total');
  return res.data?.data?.total || 0;
}
