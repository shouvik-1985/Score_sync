// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // or your backend base URL
  withCredentials: true, // if using authentication
});

export default api;
