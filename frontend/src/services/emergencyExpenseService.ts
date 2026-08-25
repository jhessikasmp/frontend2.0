// Busca todas as despesas de emergência (global)
export async function getAllEmergencyExpenses() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency-expense/all`);
  const data = await res.json();
  return data.success ? data.data : [];
}
export async function getEmergencyExpensesTotal(userId: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency-expense/user/${userId}/total`);
  const data = await res.json();
  return data.success ? data.total : 0;
}
