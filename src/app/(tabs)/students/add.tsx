import React from 'react';
import { router } from 'expo-router';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';

export default function AddStudentRoute() {
  return (
    <AddStudentScreen
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        }
      }}
      onSubmit={(data) => {
        console.log('Submitted student:', data);
        if (router.canGoBack()) {
          router.back();
        }
      }}
    />
  );
}

