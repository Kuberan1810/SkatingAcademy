import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import StartClassOverview from '@/features/batches/startCLass/StartClassOverview';

export default function StartClassScreen() {
  const params = useLocalSearchParams<any>();

  return (
    <StartClassOverview
      batchTitle={params.title ? `${params.title} Students` : undefined}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/batches' as any);
        }
      }}
    />
  );
}
