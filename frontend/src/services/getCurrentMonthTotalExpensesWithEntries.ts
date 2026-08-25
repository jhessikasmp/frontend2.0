import axios from 'axios';

export async function getCurrentMonthTotalExpensesWithEntries() {
  const apiUrl = import.meta.env.VITE_API_URL;
  try {
    const response = await axios.get(`${apiUrl}/api/expense/current-month-total-with-entries`);
    return response.data.total || 0;
  } catch (error) {
    return 0;
  }
}
