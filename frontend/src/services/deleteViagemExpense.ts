import api from './api';

export async function deleteViagemExpense(id: string) {
  const res = await api.delete(`/api/viagem-expense/${id}`);
  return res.data;
}
