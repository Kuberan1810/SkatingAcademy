import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AdminUser } from '@/types/auth';
import { isTokenExpired } from '@/utils/jwt';

export { isTokenExpired };

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';
const REMEMBERED_EMAIL_KEY = 'remembered_email';

const isWeb = Platform.OS === 'web';

type AuthExpiredCallback = () => void;
const authExpiredListeners = new Set<AuthExpiredCallback>();

/**
 * Register a listener to be notified when the session expires or receives a 401.
 */
export function onAuthExpired(callback: AuthExpiredCallback): () => void {
  authExpiredListeners.add(callback);
  return () => {
    authExpiredListeners.delete(callback);
  };
}

/**
 * Broadcast an authentication expiration event across the application.
 */
export function triggerAuthExpired(): void {
  authExpiredListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Suppress listener invocation error
    }
  });
}

export async function saveToken(token: string): Promise<void> {
  try {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    // Suppress in production
  }
}

export async function getToken(): Promise<string | null> {
  try {
    let token: string | null = null;
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        token = window.localStorage.getItem(TOKEN_KEY);
      }
    } else {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
    }

    if (token && isTokenExpired(token)) {
      await clearAuthSession();
      triggerAuthExpired();
      return null;
    }
    return token;
  } catch (error) {
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    // Suppress in production
  }
}

export async function saveUser(user: AdminUser): Promise<void> {
  try {
    const jsonValue = JSON.stringify(user);
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(USER_KEY, jsonValue);
      }
      return;
    }
    await SecureStore.setItemAsync(USER_KEY, jsonValue);
  } catch (error) {
    // Suppress in production
  }
}

export async function getUser(): Promise<AdminUser | null> {
  try {
    let jsonValue: string | null = null;
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        jsonValue = window.localStorage.getItem(USER_KEY);
      }
    } else {
      jsonValue = await SecureStore.getItemAsync(USER_KEY);
    }
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    return null;
  }
}

export async function removeUser(): Promise<void> {
  try {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(USER_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    // Suppress in production
  }
}

export async function saveRememberedEmail(email: string): Promise<void> {
  try {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      }
      return;
    }
    await SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, email);
  } catch (error) {
    // Suppress in production
  }
}

export async function getRememberedEmail(): Promise<string | null> {
  try {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      }
      return null;
    }
    return await SecureStore.getItemAsync(REMEMBERED_EMAIL_KEY);
  } catch (error) {
    return null;
  }
}

export async function removeRememberedEmail(): Promise<void> {
  try {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(REMEMBERED_EMAIL_KEY);
  } catch (error) {
    // Suppress in production
  }
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([removeToken(), removeUser()]);
}

export function getInitialAuthSync(): { token: string | null; user: AdminUser | null } {
  if (isWeb) {
    try {
      const token = window.localStorage.getItem(TOKEN_KEY);
      if (!token || isTokenExpired(token)) {
        if (token) {
          window.localStorage.removeItem(TOKEN_KEY);
          window.localStorage.removeItem(USER_KEY);
        }
        return { token: null, user: null };
      }
      const userJson = window.localStorage.getItem(USER_KEY);
      const user = userJson ? JSON.parse(userJson) : null;
      return { token, user };
    } catch {
      return { token: null, user: null };
    }
  }
  return { token: null, user: null };
}

export async function getAuthSessionParallel(): Promise<{ token: string | null; user: AdminUser | null }> {
  try {
    const [token, user] = await Promise.all([getToken(), getUser()]);
    if (!token || isTokenExpired(token)) {
      if (token) {
        await clearAuthSession();
      }
      return { token: null, user: null };
    }
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}