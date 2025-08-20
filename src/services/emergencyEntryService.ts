export async function getEmergencyEntriesYear(userId: string, year: number) {
  let url;
  if (!userId) {
    url = `${import.meta.env.VITE_API_URL}/api/emergency-entry/year/${year}`;
  } else {
    url = `${import.meta.env.VITE_API_URL}/api/emergency-entry/year/${userId}/${year}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  return data.success ? data.data : [];
}
