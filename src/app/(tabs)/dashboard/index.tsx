import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Overview from '@/features/dashboard/Overview';
import UpcomingSessions from '@/features/dashboard/UpcomingSessions';
import PendingFee from '@/features/dashboard/PendingFee';
import React, { useState } from 'react';
import Animated, { SlideInRight, Easing } from 'react-native-reanimated';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Animated.View
      entering={SlideInRight.duration(300).easing(Easing.out(Easing.exp))}
      className="flex-1 bg-white"
    >
      <ScreenWrapper>
        <Header
          variant="profile"
          userName="Rajesh Kannan"
          greeting="Welcome"
          avatarSource={require('@/assets/images/home/dp.svg')}
          onAvatarPress={() => router.push('/(tabs)/settings')}
          onNotificationPress={() => router.push('/(tabs)/notifications')}
          hasUnreadNotifications={true}
          notificationCount={2}
        />

        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search students, batches..."
          showFilter={false}
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
          <UpcomingSessions />
          <PendingFee />
        </Animated.ScrollView>
      </ScreenWrapper>
    </Animated.View>
  );
}
