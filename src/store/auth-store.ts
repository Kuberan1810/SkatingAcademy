import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AdminUser } from '@/types/auth';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'admin_user';
const REMEMBERED_EMAIL_KEY = 'remembered_email';

// Web localStorage fallback helper if running on web
const isWeb = Platform.OS === 'web';

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
    console.warn('Failed to save access token:', error);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(TOKEN_KEY);
      }
      return null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to get access token:', error);
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
    console.warn('Failed to remove access token:', error);
  }
}

export async function saveUser(user: AdminUser): Promise<void> {
  try {
    const json = JSON.stringify(user);
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(USER_KEY, json);
      }
      return;
    }
    await SecureStore.setItemAsync(USER_KEY, json);
  } catch (error) {
    console.warn('Failed to save user data:', error);
  }
}

export async function getUser(): Promise<AdminUser | null> {
  try {
    let json: string | null = null;
    if (isWeb) {
      if (typeof window !== 'undefined' && window.localStorage) {
        json = window.localStorage.getItem(USER_KEY);
      }
    } else {
      json = await SecureStore.getItemAsync(USER_KEY);
    }
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.warn('Failed to get user data:', error);
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
    console.warn('Failed to remove user data:', error);
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
    console.warn('Failed to save remembered email:', error);
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
    console.warn('Failed to get remembered email:', error);
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
    console.warn('Failed to remove remembered email:', error);
  }
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([removeToken(), removeUser()]);
}