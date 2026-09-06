import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { CollectFeeOverview } from '@/features/fees';

export default function DashboardCollectFeeScreen() {
  const params = useLocalSearchParams<any>();
  let studentData = undefined;

  if (params.studentData) {
    try {
      studentData =
        typeof params.studentData === 'string'
          ? JSON.parse(params.studentData)
          : params.studentData;
    } catch (e) {
      console.log('Error parsing studentData in DashboardCollectFeeScreen:', e);
    }
  }

  return (
    <CollectFeeOverview
      student={studentData}
      onBackPress={() => {
        if (params.from === 'pending-fees') {
          router.replace('/(tabs)/dashboard/pending-fees' as any);
        } else if (params.from === 'dashboard') {
          router.replace('/(tabs)/dashboard' as any);
        } else if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/dashboard' as any);
        }
      }}
      onConfirmSuccess={() => {
        if (params.from === 'pending-fees') {
          router.replace('/(tabs)/dashboard/pending-fees' as any);
        } else {
          router.replace('/(tabs)/dashboard' as any);
        }
      }}
    />
  );
}
