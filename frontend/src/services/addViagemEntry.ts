import api from './api';

export async function addViagemEntry(userId: string, valor: number) {
  const entry = {
    nome: 'Aporte',
    valor,
    data: new Date(),
    user: userId
  };
  const res = await api.post('/api/viagem-entry', entry);
  return res.data;
}
