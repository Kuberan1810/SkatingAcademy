import React, { useState } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import FiltersTabs from '@/components/ui/FiltersTabs';
import BtnCom from '@/components/ui/BtnCom';
import UpcomingSessionsCard, { UpcomingSessionsCardProps } from '@/components/ui/UpcomingSessionsCard';

export interface UpcomingSessionItem extends UpcomingSessionsCardProps {
  id: string;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening';
}

export interface UpcomingSessionsProps {
  date?: string;
  sessions?: UpcomingSessionItem[];
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
  onViewAllPress,
  onSessionPress,
  onStatusPress,
  style,
  className = '',
}: UpcomingSessionsProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredSessions = sessions.filter((session) => {
    if (activeFilter === 'All') return true;
    return session.timeOfDay === activeFilter;
  });

  return (
    <View style={style} className={`mt-6 ${className}`}>
      {/* Header Row: Title & Date + View All Button */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 mr-3">
          <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight">
            Upcoming Sessions
          </Text>
          <Text className="text-[16px] font-urbanist-medium text-secondary mt-1">
            {date}
          </Text>
        </View>

        <BtnCom label="View all" onClick={onViewAllPress} />
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
        {filteredSessions.map((session) => (
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
        ))}
      </View>
    </View>
  );
}

