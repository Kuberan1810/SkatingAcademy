import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { StudentProfileScreen } from '@/features/studentProfile';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

export default function BatchStudentProfileRoute() {
  const params = useLocalSearchParams<any>();
  const { hideTabBar } = useTabBarVisibility();

  React.useEffect(() => {
    hideTabBar();
  }, [hideTabBar]);

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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (params.from === 'completed-class') {
      router.replace('/(tabs)/batches/completed-class' as any);
    } else {
      router.replace('/(tabs)/batches' as any);
    }
  };

  return (
    <StudentProfileScreen
      studentId={params.id}
      student={parsedStudent || undefined}
      initialTab={(params.initialTab as any) || 'overview'}
      shouldRestoreTabBarOnUnmount={false}
      onBackPress={handleBack}
    />
  );
}
