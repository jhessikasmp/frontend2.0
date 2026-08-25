import axios from 'axios';

export async function addCarroEntry(userId: string, valor: number) {
  const entry = {
    nome: 'Aporte',
    valor,
    data: new Date(),
    user: userId
  };
  const res = await axios.post('/api/carro-entry', entry);
  return res.data;
}
