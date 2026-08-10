import React from 'react';
import { router } from 'expo-router';
import PendingFeeOverview from '@/features/dashboard/PendingFee/PendingFeeOverview';

export default function PendingFeesScreen() {
  return (
    <PendingFeeOverview
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
