import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { LoginRequest, LoginResponse, AdminUser } from '@/types/auth';

export const authApi = {
  /**
   * POST /api/v1/auth/login
   * Authenticate admin user with email and password.
   */
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      ENDPOINTS.auth.login,
      payload
    );
    return response.data;
  },

  /**
   * GET /api/v1/auth/me
   * Retrieve current authenticated admin profile.
   */
  getMe: async (): Promise<AdminUser> => {
    const response = await apiClient.get<AdminUser>(
      ENDPOINTS.auth.me
    );
    return response.data;
  },

  /**
   * POST /api/v1/auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.auth.logout);
    } catch {
      // Best effort logout on server
    }
  },
};