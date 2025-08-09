import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api/users', // ajuste a porta e URL conforme o backend
});

export const registerUser = async (name) => {
  const response = await api.post('/register', { name });
  return response.data;
};

export const loginUser = async (name) => {
  const response = await api.post('/login', { name });
  return response.data;
};
