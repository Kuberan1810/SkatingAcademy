import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Overview from '@/features/dashboard/Overview';
import UpcomingSessions from '@/features/dashboard/UpcomingSessions';
import PendingFee from '@/features/dashboard/PendingFee';
import React, { useState } from 'react';
import Animated, { SlideInRight, Easing } from 'react-native-reanimated';

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Animated.View
      entering={SlideInRight.duration(300).easing(Easing.out(Easing.exp))}
      className="flex-1 bg-white"
    >
      <ScreenWrapper>
        <Header
          userName="Rajesh Kannan"
          greeting="Welcome"
          avatarSource={require('@/assets/images/home/dp.svg')}
          onNotificationPress={() => console.log('Notification pressed')}
        />

        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search students, batches..."
          showFilter={false}
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
          <UpcomingSessions />
          <PendingFee />
        </Animated.ScrollView>
      </ScreenWrapper>
    </Animated.View>
  );
}
