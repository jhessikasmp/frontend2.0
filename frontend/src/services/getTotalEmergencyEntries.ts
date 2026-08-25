import axios from 'axios';

export async function getTotalEmergencyEntries() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const res = await axios.get(`${apiUrl}/api/emergency-entry/total`);
  return res.data.total || 0;
}
