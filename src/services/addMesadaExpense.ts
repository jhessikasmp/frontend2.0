import axios from 'axios';

export async function addMesadaExpense(userId: string, nome: string, valor: number, data: string) {
  const expense = {
    nome,
    valor,
    data,
    user: userId
  };
  const res = await axios.post('/api/mesada-expense', expense);
  return res.data;
}
