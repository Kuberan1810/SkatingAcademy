import { Text, View } from 'react-native';
import React from 'react';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import { router } from 'expo-router';
import { Setting2 } from 'iconsax-react-native';

export default function BatchesScreen() {
  return (
    <ScreenWrapper>
      <Header
        variant="page"
        title="Batches"
        onBackPress={() => router.back()}
        rightIcon={Setting2}
        onRightPress={() => {
          console.log('Settings pressed');
        }}
      />
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-lg font-urbanist-bold text-gray-800">
          Batches Screen
        </Text>
      </View>
    </ScreenWrapper>
  );
}