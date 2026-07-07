import axios from 'axios';

import { clearStoredSession, getStoredToken } from '../auth/auth.constants';
import {
  applyAuthHeader,
  isAuthEndpoint,
  isAuthenticationFailure401,
  requestHadAuthHeader,
} from '../utils/axios-auth.util';

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
    applyAuthHeader(config, token);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // Samo pravi auth failure (401) može očistiti sesiju.
    // 400, 403, 404, 500 i network error nikada ne izloguju.
    if (
      status === 401 &&
      isAuthenticationFailure401(error) &&
      !isAuthEndpoint(error.config?.url) &&
      requestHadAuthHeader(error.config) &&
      Boolean(getStoredToken())
    ) {
      clearStoredSession();
    }

    return Promise.reject(error);
  },
);
