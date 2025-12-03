
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Change when backend is ready

const api = axios.create({
  baseURL: API_URL,
});

// Later you'll add real login/register calls here
// For now, we use mock in components

export const loginUser = (credentials) => api.post('/login', credentials);
export const registerUser = (userData) => api.post('/register', userData);

export default api;