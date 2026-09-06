import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { CollectFeeOverview } from '@/features/fees';

export default function CollectFeeScreen() {
  const params = useLocalSearchParams<any>();
  let studentData = undefined;

  if (params.studentData) {
    try {
      studentData =
        typeof params.studentData === 'string'
          ? JSON.parse(params.studentData)
          : params.studentData;
    } catch (e) {
      console.log('Error parsing studentData in CollectFeeScreen:', e);
    }
  }

  return (
    <CollectFeeOverview
      student={studentData}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/fees' as any);
        }
      }}
      onConfirmSuccess={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/fees' as any);
        }
      }}
    />
  );
}