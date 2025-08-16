import axios from 'axios';

export async function getAllUsers() {
  const res = await axios.get('/api/users');
  return res.data;
}
