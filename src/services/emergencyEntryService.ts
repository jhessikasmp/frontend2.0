export async function getEmergencyEntriesYear(userId: string, year: number) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency-entry/year/${userId}/${year}`);
  const data = await res.json();
  return data.success ? data.data : [];
}
