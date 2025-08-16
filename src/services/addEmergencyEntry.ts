export async function addEmergencyEntry(userId: string, valor: number) {
  const res = await fetch('http://localhost:5000/api/emergency-entry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: userId, valor, data: new Date() })
  });
  const data = await res.json();
  return data.success ? data.data : null;
}
