import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import CompletedClassOverview from '@/features/batches/CompletedClass/CompletedClassOverview';

export default function CompletedClassScreen() {
  const params = useLocalSearchParams<any>();

  return (
    <CompletedClassOverview
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
