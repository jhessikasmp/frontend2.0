import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export async function addViagemEntry(userId: string, valor: number) {
  const entry = {
    nome: 'Aporte',
    valor,
    data: new Date(),
    user: userId
  };
  const res = await axios.post(`${apiUrl}/api/viagem-entry`, entry);
  return res.data;
}
