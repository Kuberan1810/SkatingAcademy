import React from 'react';
import { router } from 'expo-router';
import { FeeOverview } from '@/features/fees';

export default function FeesScreen() {
  return (
    <FeeOverview
      screenTitle="Sathya Stadium Fee"
      onStudentPress={(student) => {
        router.push({
          pathname: '/(tabs)/fees/student-profile',
          params: { id: student.id, studentData: JSON.stringify(student) },
        } as any);
      }}
    />
  );
}