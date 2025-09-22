import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://13.203.97.195:3001',
  baseURL: 'http://localhost:3000',
});

export default api;