import axios from 'axios';

export async function addMesadaEntry(userId: string, valor: number) {
  const entry = {
    nome: 'Aporte',
    valor,
    data: new Date(),
    user: userId
  };
  const res = await axios.post('/api/mesada-entry', entry);
  return res.data;
}
