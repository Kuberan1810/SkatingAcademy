import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { Setting2 } from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import FiltersTabs from '@/components/ui/FiltersTabs';
import UpcomingSessionsCard from '@/components/ui/UpcomingSessionsCard';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

export interface UpcomingSessionOverviewItem {
  id: string;
  title: string;
  time: string;
  studentsCount: string;
  status: 'start' | 'completed' | string;
  statusLabel?: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface UpcomingSessionsOverviewProps {
  dateText?: string;
  sessions?: UpcomingSessionOverviewItem[];
  onBackPress?: () => void;
  onSessionPress?: (session: UpcomingSessionOverviewItem) => void;
  onStatusPress?: (session: UpcomingSessionOverviewItem) => void;
}

const DEFAULT_SESSIONS: UpcomingSessionOverviewItem[] = [
  {
    id: '1',
    title: 'Don Bosco',
    time: '9:00 - 10:00 am',
    studentsCount: '24 Students',
    status: 'completed',
    timeOfDay: 'Morning',
  },
  {
    id: '2',
    title: 'Sathya Stadium',
    time: '12:00 - 01:00 am',
    studentsCount: '18 Students',
    status: 'start',
    timeOfDay: 'Afternoon',
  },
  {
    id: '3',
    title: 'Sathya Stadium Evening',
    time: '5:00 - 6:30 pm',
    studentsCount: '20 Students',
    status: 'start',
    timeOfDay: 'Evening',
  },
];

export default function UpcomingSessionsOverview({
  dateText = 'Friday, 15 Jan, 2024',
  sessions = DEFAULT_SESSIONS,
  onBackPress,
  onSessionPress,
  onStatusPress,
}: UpcomingSessionsOverviewProps) {
  // Hide tab bar while on full page view
  const { hideTabBar, showTabBar } = useTabBarVisibility();

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        !searchQuery.trim() ||
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.studentsCount.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        activeFilter === 'All' || session.timeOfDay === activeFilter;

      return matchesSearch && matchesTab;
    });
  }, [sessions, searchQuery, activeFilter]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/dashboard' as any);
    }
  };

  const handleStartOrStatus = (session: UpcomingSessionOverviewItem) => {
    if (onStatusPress) {
      onStatusPress(session);
    } else {
      router.push('/(tabs)/batches/start-class' as any);
    }
  };

  return (
    <ScreenWrapper>
      {/* Header with Back, Title, Date Subtitle, and Settings Icon */}
      <Header
        variant="page"
        title="Upcoming Sessions"
        subtitle={dateText}
        showBack={true}
        onBackPress={handleBack}
        rightIcon={Setting2}
        onRightPress={() => console.log('Settings pressed')}
      />

      {/* Search Input Bar with Filter Button */}
      <View className=" mb-4">
        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search students, batches..."
          showFilter={true}
          onFilterPress={() => console.log('Filter button pressed')}
        />
      </View>

      {/* Filter Tabs */}
      <View className="px-5 mb-4">
        <FiltersTabs
          tabs={['All', 'Morning', 'Afternoon', 'Evening']}
          activeTab={activeFilter}
          onSelectTab={setActiveFilter}
          scrollable={false}
        />
      </View>

      {/* Sessions List */}
      <Animated.ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="always"
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        <View className="gap-3.5">
          {filteredSessions.map((session) => (
            <UpcomingSessionsCard
              key={session.id}
              title={session.title}
              time={session.time}
              studentsCount={session.studentsCount}
              status={session.status}
              statusLabel={session.statusLabel}
              onPressCard={() => onSessionPress?.(session)}
              onStatusPress={() => handleStartOrStatus(session)}
            />
          ))}
        </View>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
