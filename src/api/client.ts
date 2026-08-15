import axios from 'axios';
import { getToken, clearAuthSession } from '@/store/auth-store';

export const API_BASE_URL = 'https://skatingacademybackend.onrender.com';

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
      // Proceed without token if error reading store
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handling for 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthSession();
    }
    return Promise.reject(error);
  }
);

export default apiClient;