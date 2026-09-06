import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from '@/api/auth.api';
import { LoginRequest, LoginResponse, AdminUser } from '@/types/auth';
import { getToken } from '@/store/auth-store';
import { getErrorMessage } from '@/utils/error';
import { useAuthContext } from '@/context/auth-context';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
};

/**
 * Hook for authenticating admin user with TanStack Query mutation.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { setSession } = useAuthContext();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      return await authApi.login(credentials);
    },
    onSuccess: async (data) => {
      let user: AdminUser | null = null;

      // Fetch and cache profile
      try {
        user = await authApi.getMe();
        if (user) {
          queryClient.setQueryData(AUTH_KEYS.me, user);
        }
      } catch {
        // Continue even if profile fetch has a delay
      }

      // Update AuthContext session (which saves token and user in store)
      if (data.access_token) {
        await setSession(data.access_token, user);
      }

      // Invalidate auth queries to trigger fresh state
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
 * Hook for logging out and wiping session state locally without backend API.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      await logout();
      queryClient.clear();
    },
    onSuccess: () => {
      router.replace('/(auth)/login');
    },
  });
}

/**
 * Unified auth hook for general access.
 */
export function useAuth() {
  const authContext = useAuthContext();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const meQuery = useMe();

  return {
    // Current User Profile & Auth Status
    user: meQuery.data || authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isUserLoading: meQuery.isLoading || authContext.isLoading,
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

