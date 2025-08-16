import axios from 'axios';

export async function addViagemExpense(userId: string, nome: string, valor: number, data: string) {
  const expense = {
    nome,
    valor,
    data,
    user: userId
  };
  const res = await axios.post('/api/viagem-expense', expense);
  return res.data;
}
