import React from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import StudentListOverview from '@/features/batches/StudentListScreen/StudentListOverview';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

export default function StudentListScreen() {
  const params = useLocalSearchParams<any>();
  const batchId = params.id || params.batch_id || params.batchId || 5;
  const { showTabBar } = useTabBarVisibility();

  useFocusEffect(
    React.useCallback(() => {
      showTabBar();
    }, [showTabBar])
  );

  return (
    <StudentListOverview
      batchId={batchId}
      batchTitle={params.title ? `${params.title}` : undefined}
      batchSubtitle={params.batch_name || params.batchName || params.subtitle || params.title}
      totalStudents={params.students_count || params.studentsCount || params.totalStudents}
      avgAttendance={params.attendance || params.avgAttendance}
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