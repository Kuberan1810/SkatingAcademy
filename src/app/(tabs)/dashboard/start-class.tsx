import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import StartClassOverview from '@/features/batches/startCLass/StartClassOverview';

export default function DashboardStartClassScreen() {
  const params = useLocalSearchParams<any>();

  return (
    <StartClassOverview
      batchTitle={params.title ? `${params.title} Students` : undefined}
      onBackPress={() => {
        if (params.from === 'upcoming-sessions') {
          router.replace('/(tabs)/dashboard/upcoming-sessions' as any);
        } else if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/dashboard' as any);
        }
      }}
    />
  );
}
