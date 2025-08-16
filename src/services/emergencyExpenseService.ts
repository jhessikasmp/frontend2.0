export async function getEmergencyExpensesTotal(userId: string) {
  const res = await fetch(`http://localhost:5000/api/emergency-expense/user/${userId}/total`);
  const data = await res.json();
  return data.success ? data.total : 0;
}
