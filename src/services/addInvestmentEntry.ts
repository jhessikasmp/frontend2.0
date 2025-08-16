import axios from 'axios';

export async function addInvestmentEntry(user: string, value: number, moeda: string) {
  return axios.post('/api/investment-entry', { user, value, moeda });
}
