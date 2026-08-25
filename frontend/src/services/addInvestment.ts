import axios from 'axios';

export async function addInvestment(data: any) {
  return axios.post('/api/investment', data);
}
