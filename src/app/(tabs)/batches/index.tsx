import React, { useState } from 'react';
import Animated from 'react-native-reanimated';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Overview from '@/features/dashboard/Overview';
import BatchList from '@/features/batches/BatchList';
import { router } from 'expo-router';
import { Setting2 } from 'iconsax-react-native';

import { useTabBarVisibility } from '@/context/tab-bar-visibility';

export default function BatchesScreen() {
  const { handleScroll } = useTabBarVisibility();
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        keyboardShouldPersistTaps="handled"
        scrollsToTop={true}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 140,
        }}
      >
        <Overview />
        <BatchList
          onBatchPress={(item) => {
            if (item.status === 'completed' || !!item.attendance) {
              router.push('/(tabs)/batches/completed-class' as any);
            } else {
              router.push('/(tabs)/batches/StudentListScreen' as any);
            }
          }}
          onStartPress={(item) => router.push('/(tabs)/batches/start-class')}
          onAttendancePress={(item) => router.push('/(tabs)/batches/completed-class' as any)}
          onMorePress={(item) => console.log('More options for:', item.title)}
        />
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
