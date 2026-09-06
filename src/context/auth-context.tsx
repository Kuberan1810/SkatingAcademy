import {
  clearAuthSession,
  getAuthSessionParallel,
  getInitialAuthSync,
  isTokenExpired,
  onAuthExpired,
  saveToken,
  saveUser,
} from '@/store/auth-store';
import { AdminUser } from '@/types/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, PanResponder, Platform, View } from 'react-native';

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes auto-logout threshold

interface AuthContextType {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string | null, user: AdminUser | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Synchronous initial load for web / immediate memory
  const initialSync = getInitialAuthSync();
  const initialValidToken =
    initialSync.token && !isTokenExpired(initialSync.token) ? initialSync.token : null;
  const initialValidUser = initialValidToken ? initialSync.user : null;

  const [token, setToken] = useState<string | null>(initialValidToken);
  const [user, setUser] = useState<AdminUser | null>(initialValidUser);
  const [isLoading, setIsLoading] = useState<boolean>(Platform.OS !== 'web' && !initialValidToken);

  // Subscribe to global 401 / auth expiration events from apiClient
  useEffect(() => {
    const unsubscribe = onAuthExpired(() => {
      setToken(null);
      setUser(null);
      queryClient.clear();
      router.replace('/(auth)/login');
    });
    return unsubscribe;
  }, [queryClient, router]);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialSession() {
      if (Platform.OS === 'web' && initialValidToken) {
        setIsLoading(false);
        return;
      }
      try {
        const session = await getAuthSessionParallel();
        if (isMounted) {
          if (session.token && !isTokenExpired(session.token)) {
            setToken(session.token);
            setUser(session.user);
          } else {
            setToken(null);
            setUser(null);
            await clearAuthSession();
          }
        }
      } catch {
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadInitialSession();
    return () => {
      isMounted = false;
    };
  }, [initialValidToken]);

  // Instant UI state update + non-blocking background disk persistence
  const setSession = useCallback(async (newToken: string | null, newUser: AdminUser | null) => {
    if (newToken && !isTokenExpired(newToken)) {
      setToken(newToken);
      setUser(newUser);
      await Promise.all([saveToken(newToken), newUser ? saveUser(newUser) : Promise.resolve()]);
    } else {
      setToken(null);
      setUser(null);
      await clearAuthSession();
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await clearAuthSession();
    queryClient.clear();
  }, [queryClient]);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && !isTokenExpired(token)),
    isLoading,
    setSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, isLoading, logout } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === '(auth)';
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  // Function to reset inactivity timer on touch / interaction
  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;

    // Check token validity on every interaction
    if (token && isTokenExpired(token)) {
      logout();
      router.replace('/(auth)/login');
      return;
    }

    lastActiveRef.current = Date.now();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      logout();
      router.replace('/(auth)/login');
    }, INACTIVITY_TIMEOUT_MS);
  }, [isAuthenticated, token, logout, router]);

  // Periodic token expiration check (every 15 seconds)
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        logout();
        router.replace('/(auth)/login');
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token, logout, router]);

  // Handle AppState changes (e.g. app backgrounded vs active foreground)
  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    resetInactivityTimer();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Immediately verify token expiration when waking from background
        if (token && isTokenExpired(token)) {
          logout();
          router.replace('/(auth)/login');
          return;
        }

        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          logout();
          router.replace('/(auth)/login');
        } else {
          resetInactivityTimer();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        lastActiveRef.current = Date.now();
      }
    });

    return () => {
      subscription.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, token, resetInactivityTimer, logout, router]);

  // Touch tracking PanResponder to reset 10-minute timer on every touch
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => {
          resetInactivityTimer();
          return false;
        },
        onMoveShouldSetPanResponderCapture: () => {
          resetInactivityTimer();
          return false;
        },
      }),
    [resetInactivityTimer]
  );

  // Strict route redirect guard
  useEffect(() => {
    if (isLoading) return;

    const hasValidSession = Boolean(token && !isTokenExpired(token));

    if (!hasValidSession && !inAuthGroup) {
      // User is not authenticated or token is expired -> Kick out to login
      router.replace('/(auth)/login');
    } else if (hasValidSession && inAuthGroup) {
      // User is authenticated with a valid token -> Send into dashboard
      router.replace('/(tabs)/dashboard');
    }
  }, [token, isLoading, inAuthGroup, router]);

  const hasValidSession = Boolean(token && !isTokenExpired(token));

  if (isLoading || (!hasValidSession && !inAuthGroup) || (hasValidSession && inAuthGroup)) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} {...(hasValidSession ? panResponder.panHandlers : {})}>
      {children}
    </View>
  );
}
