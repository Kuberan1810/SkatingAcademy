import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { StudentProfileScreen } from '@/features/studentProfile';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

export default function FeesStudentProfileRoute() {
  const params = useLocalSearchParams<any>();
  const { hideTabBar } = useTabBarVisibility();

  React.useEffect(() => {
    hideTabBar();
  }, [hideTabBar]);

  let parsedStudent = null;
  if (params.studentData) {
    try {
      parsedStudent =
        typeof params.studentData === 'string'
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
          router.replace('/(tabs)/fees' as any);
        }
      }}
    />
  );
}
