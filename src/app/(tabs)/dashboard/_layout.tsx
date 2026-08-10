import { Stack } from 'expo-router';
import React from 'react';

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'simple_push',
        animationDuration: 180,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="upcoming-sessions" />
      <Stack.Screen name="pending-fees" />
      <Stack.Screen name="start-class" />
      <Stack.Screen name="completed-class" />
      <Stack.Screen name="student-profile" />
    </Stack>
  );
}
