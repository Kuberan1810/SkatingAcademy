import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { StudentProfileScreen } from '@/features/studentProfile';

export default function StudentProfileRoute() {
  const params = useLocalSearchParams<any>();

  let parsedStudent = null;
  if (params.studentData) {
    try {
      parsedStudent = typeof params.studentData === 'string'
        ? JSON.parse(params.studentData)
        : params.studentData;
    } catch (e) {
      console.log('Error parsing studentData:', e);
    }
  }

  return (
    <StudentProfileScreen
      studentId={params.id}
      student={parsedStudent || undefined}
      shouldRestoreTabBarOnUnmount={true}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/students');
        }
      }}
    />
  );
}
