import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';

export default function AddStudentRoute() {
  const params = useLocalSearchParams<{
    mode?: 'create' | 'edit';
    studentId?: string;
    openImport?: string;
  }>();

  return (
    <AddStudentScreen
      studentId={params.studentId}
      mode={params.mode === 'edit' ? 'edit' : 'create'}
      initialImportModalOpen={params.openImport === 'true' || params.openImport === '1'}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
      onSubmit={(data) => {
        console.log('Submitted student:', data);
      }}
    />
  );
}
