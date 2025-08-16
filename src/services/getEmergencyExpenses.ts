export async function getEmergencyExpenses(userId: string) {
  const res = await fetch(`http://localhost:5000/api/emergency-expense/user/${userId}`);
  const data = await res.json();
  return data.success ? data.data : [];
}
