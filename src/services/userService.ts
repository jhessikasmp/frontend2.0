import axios from 'axios';

export async function getAllUsers() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const base = apiUrl ? apiUrl.replace(/\/$/, '') : '';
  const url = base ? `${base}/api/users` : '/api/users';
  const res = await axios.get(url);
  const payload = res.data;
  // Some endpoints wrap data in { success, data }, others may return the array directly
  return payload?.data ?? payload;
}
