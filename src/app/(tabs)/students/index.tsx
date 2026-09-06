import React from 'react';
import { useFocusEffect } from 'expo-router';
import { AllStudentsOverview } from '@/features/students';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

export default function StudentsScreen() {
  const { showTabBar } = useTabBarVisibility();

  useFocusEffect(
    React.useCallback(() => {
      showTabBar();
    }, [showTabBar])
  );

  return <AllStudentsOverview />;
}
