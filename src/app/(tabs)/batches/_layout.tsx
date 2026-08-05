import { Stack } from 'expo-router';
import React from 'react';

export default function BatchesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'simple_push',
        animationDuration: 180,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="StudentListScreen" />
      <Stack.Screen name="start-class" />
    </Stack>
  );
}
