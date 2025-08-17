export async function getEmergencyExpenses(userId: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency-expense/user/${userId}`);
  const data = await res.json();
  return data.success ? data.data : [];
}
