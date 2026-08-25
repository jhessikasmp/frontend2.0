import axios from 'axios';

export async function addViagemEntry(userId: string, valor: number) {
  const entry = {
    nome: 'Aporte',
    valor,
    data: new Date(),
    user: userId
  };
  const res = await axios.post('/api/viagem-entry', entry);
  return res.data;
}
