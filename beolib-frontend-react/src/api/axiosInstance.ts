import axios from 'axios';

import { getStoredToken } from '../auth/auth.constants';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error('VITE_API_URL nije definisan u environment fajlu.');
}

/** Centralni axios klijent — baseURL iz Vite env varijable. */
export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
