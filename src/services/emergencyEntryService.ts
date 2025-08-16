export async function getEmergencyEntriesYear(userId: string, year: number) {
  const res = await fetch(`http://localhost:5000/api/emergency-entry/year/${userId}/${year}`);
  const data = await res.json();
  return data.success ? data.data : [];
}
