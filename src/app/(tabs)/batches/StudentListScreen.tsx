import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import StudentListOverview from '@/features/batches/StudentListScreen/StudentListOverview';

export default function StudentListScreen() {
  const params = useLocalSearchParams<any>();

  return (
    <StudentListOverview
      batchTitle={params.title ? `${params.title}` : undefined}
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