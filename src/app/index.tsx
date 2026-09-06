import { Redirect } from 'expo-router';
import React from 'react';
import { useAuthContext } from '@/context/auth-context';
import { isTokenExpired } from '@/store/auth-store';

export default function Index() {
  const { token, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return null;
  }

  const isValidSession = Boolean(token && !isTokenExpired(token) && isAuthenticated);

  if (isValidSession) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}