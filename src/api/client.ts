import axios from 'axios';
import { getToken, clearAuthSession, triggerAuthExpired } from '@/store/auth-store';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://skatingacademybackend-9rfm.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach access token automatically to outgoing requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Proceed without token if store access fails
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handling for 401 Unauthorized and expired tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthSession();
      triggerAuthExpired();
    }
    return Promise.reject(error);
  }
);

export default apiClient;