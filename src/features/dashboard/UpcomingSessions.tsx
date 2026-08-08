import React, { useState } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { CalendarRemove } from 'iconsax-react-native';
import { router } from 'expo-router';
import FiltersTabs from '@/components/ui/FiltersTabs';
import BtnCom from '@/components/ui/BtnCom';
import UpcomingSessionsCard, { UpcomingSessionsCardProps } from '@/components/ui/UpcomingSessionsCard';
import styles from '@/styles/styles';

export interface UpcomingSessionItem extends UpcomingSessionsCardProps {
  id: string;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening';
}

export interface UpcomingSessionsProps {
  date?: string;
  sessions?: UpcomingSessionItem[];
  emptyText?: string;
  onViewAllPress?: () => void;
  onSessionPress?: (session: UpcomingSessionItem) => void;
  onStatusPress?: (session: UpcomingSessionItem) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const DEFAULT_SESSIONS: UpcomingSessionItem[] = [
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
];

export default function UpcomingSessions({
  date = 'Friday, 15 Jan, 2024',
  sessions = DEFAULT_SESSIONS,
  emptyText = 'No classes',
  onViewAllPress,
  onSessionPress,
  onStatusPress,
  style,
  className = '',
}: UpcomingSessionsProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      router.push('/(tabs)/dashboard/upcoming-sessions' as any);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (activeFilter === 'All') return true;
    return session.timeOfDay === activeFilter;
  });

  return (
    <View style={style} className={`mt-[30px] ${className}`}>
      {/* Header Row: Title & Date + View All Button */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 mr-3">
          <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight">
            Upcoming Sessions
          </Text>
          <Text className="text-[16px] font-urbanist-medium text-secondary mt-1">
            {date}
          </Text>
        </View>

        <BtnCom label="View all" onClick={handleViewAll} />
      </View>

      {/* Filter Tabs */}
      <FiltersTabs
        tabs={['All', 'Morning', 'Afternoon', 'Evening']}
        activeTab={activeFilter}
        onSelectTab={setActiveFilter}
        scrollable={false}
        containerClassName="mb-4"
      />

      {/* Reusable Upcoming Sessions Cards */}
      <View className="gap-3.5">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <UpcomingSessionsCard
              key={session.id}
              title={session.title}
              time={session.time}
              studentsCount={session.studentsCount}
              status={session.status}
              statusLabel={session.statusLabel}
              onPressCard={() => onSessionPress?.(session)}
              onStatusPress={() => onStatusPress?.(session)}
            />
          ))
        ) : (
          <View style={styles.BoxStyle} className="py-8 items-center justify-center">
            <View style={styles.IconStyle} className="mb-2 p-2.5">
              <CalendarRemove size={24} color="#8A8A8E" variant="Linear" />
            </View>
            <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
              {emptyText}
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
              There are no sessions scheduled for this time.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}


