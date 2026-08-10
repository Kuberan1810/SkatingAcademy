import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import CompletedClassOverview from '@/features/batches/CompletedClass/CompletedClassOverview';

export default function DashboardCompletedClassScreen() {
  const params = useLocalSearchParams<any>();

  return (
    <CompletedClassOverview
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
