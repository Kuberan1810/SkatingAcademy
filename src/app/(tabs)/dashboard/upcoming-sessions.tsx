import React from 'react';
import { router } from 'expo-router';
import UpcomingSessionsOverview from '@/features/dashboard/UpcommingSessions/UpcomingSessionsOverview';

export default function UpcomingSessionsScreen() {
  return (
    <UpcomingSessionsOverview
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/dashboard' as any);
        }
      }}
    />
  );
}
