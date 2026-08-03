import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Overview from '@/features/dashboard/Overview';
import UpcomingSessions from '@/features/dashboard/UpcomingSessions';
import React from 'react';
import { useState } from 'react';
import { ScrollView } from 'react-native';

export default function DashboardScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
      >
        <Overview />
        <UpcomingSessions />
      </ScrollView>
    </ScreenWrapper>
  );
}


