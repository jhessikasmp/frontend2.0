import axios from 'axios';

export async function getAnnualSalary(userId: string, year: number) {
  const res = await axios.get(`/api/salary/user/${userId}/year/${year}`);
  return res.data.data || [];
}
