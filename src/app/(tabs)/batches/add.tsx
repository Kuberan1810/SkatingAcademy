import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import CreateBatchScreen from '@/features/creation/BatchCreation/CreateBatchScreen';

export default function CreateBatchRoute() {
  const params = useLocalSearchParams<{
    mode?: 'create' | 'edit';
    batchName?: string;
    level?: string;
    location?: string;
    description?: string;
    classType?: string;
    trainingDays?: string;
    startTime?: string;
    endTime?: string;
    monthlyFee?: string;
    yearlyFee?: string;
  }>();

  const isEdit = params.mode === 'edit';

  return (
    <CreateBatchScreen
      mode={isEdit ? 'edit' : 'create'}
      headerTitle={isEdit ? 'Edit Batch' : 'Create Batch'}
      initialValues={{
        batchName: params.batchName || (isEdit ? 'Morning Batch' : ''),
        level: params.level || 'Basic',
        location: params.location || 'Sathya Stadium',
        description: params.description || '',
        classType: params.classType || 'Weekend',
        trainingDays: params.trainingDays || 'Sat, Sun',
        startTime: params.startTime || '06:00 AM',
        endTime: params.endTime || '07:30 AM',
        monthlyFee: params.monthlyFee || '₹1,250',
        yearlyFee: params.yearlyFee || '₹1,250',
      }}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
      onSubmit={(data) => {
        console.log(isEdit ? 'Updated batch:' : 'Created batch:', data);
        if (router.canGoBack()) {
          router.back();
        }
      }}
    />
  );
}
