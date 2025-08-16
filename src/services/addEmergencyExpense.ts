export async function addEmergencyExpense(userId: string, nome: string, valor: number, data: string, descricao?: string) {
  const res = await fetch('http://localhost:5000/api/emergency-expense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: userId, nome, valor, data, descricao })
  });
  const dataRes = await res.json();
  return dataRes.success ? dataRes.data : null;
}
