import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export async function addViagemExpense(userId: string, nome: string, valor: number, data: string) {
  const expense = {
    nome,
    valor,
    data,
    user: userId
  };
  const res = await axios.post(`${apiUrl}/api/viagem-expense`, expense);
  return res.data;
}
