import React, { useState } from 'react';
import Animated from 'react-native-reanimated';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Overview from '@/features/dashboard/Overview';
import BatchList from '@/features/batches/BatchList';
import { router } from 'expo-router';
import { Setting2 } from 'iconsax-react-native';

export default function BatchesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

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
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search students, batches..."
        showFilter={true}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1}
        decelerationRate={0.998}
        bounces={true}
        alwaysBounceVertical={true}
        directionalLockEnabled={true}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        scrollsToTop={true}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 200 }}
      >
        <Overview />
        <BatchList
          onBatchPress={(item) => router.push('/(tabs)/batches/StudentListScreen')}
          onStartPress={(item) => router.push('/(tabs)/batches/start-class')}
          onAttendancePress={(item) => router.push('/(tabs)/batches/start-class')}
          onMorePress={(item) => console.log('More options for:', item.title)}
        />
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
