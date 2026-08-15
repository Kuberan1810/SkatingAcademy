import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from '@/api/auth.api';
import { LoginRequest, LoginResponse, AdminUser } from '@/types/auth';
import { saveToken, saveUser, clearAuthSession, getToken } from '@/store/auth-store';
import { getErrorMessage } from '@/utils/error';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
};

/**
 * Hook for authenticating admin user with TanStack Query mutation.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      return await authApi.login(credentials);
    },
    onSuccess: async (data) => {
      // 1. Store JWT token securely
      if (data.access_token) {
        await saveToken(data.access_token);
      }

      // 2. Fetch and cache profile in background
      try {
        const user = await authApi.getMe();
        if (user) {
          await saveUser(user);
          queryClient.setQueryData(AUTH_KEYS.me, user);
        }
      } catch {
        // Continue even if profile fetch has a delay
      }

      // 3. Invalidate auth queries to trigger fresh state
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all });
    },
  });
}

/**
 * Hook for fetching current admin profile using TanStack Query.
 */
export function useMe() {
  return useQuery<AdminUser, Error>({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      return await authApi.getMe();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook for logging out and wiping session state.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSettled: async () => {
      await clearAuthSession();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}

/**
 * Unified auth hook for general access.
 */
export function useAuth() {
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const meQuery = useMe();

  return {
    // Current User Profile
    user: meQuery.data,
    isUserLoading: meQuery.isLoading,
    isUserError: meQuery.isError,

    // Login Mutation
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? getErrorMessage(loginMutation.error) : null,
    loginReset: loginMutation.reset,

    // Logout Mutation
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}

export default useAuth;
