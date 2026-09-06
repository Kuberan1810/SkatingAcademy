import React, { useState } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { CalendarRemove } from 'iconsax-react-native';
import { router } from 'expo-router';
import FiltersTabs from '@/components/ui/FiltersTabs';
import BtnCom from '@/components/ui/BtnCom';
import UpcomingSessionsCard, { UpcomingSessionsCardProps } from '@/components/ui/UpcomingSessionsCard';
import styles from '@/styles/styles';
import { useStartSession } from '@/hooks/use-sessions';
import { getErrorMessage } from '@/utils/error';
import Toast from '@/components/ui/Toast';

export interface UpcomingSessionItem extends UpcomingSessionsCardProps {
  id: string;
  batchId?: number;
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

const getFormattedTodayDate = (): string => {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

export default function UpcomingSessions({
  date,
  sessions = [],
  emptyText = 'No classes',
  onViewAllPress,
  onSessionPress,
  onStatusPress,
  style,
  className = '',
}: UpcomingSessionsProps) {
  const displayDate = date || getFormattedTodayDate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' | 'info' | 'delete' }>({
    visible: false,
    message: '',
    type: 'error',
  });

  const startSessionMutation = useStartSession();

  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      router.push('/(tabs)/dashboard/upcoming-sessions' as any);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const statusLower = (session.status || '').toLowerCase();
    const isNoClass = statusLower === 'no_class' || statusLower === 'noclass' || statusLower === 'no class';
    const isCompleted = statusLower === 'completed' || statusLower.includes('complete');

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Completed') return isCompleted;
    if (activeFilter === 'No Class') return isNoClass;
    return session.timeOfDay === activeFilter;
  });

  const triggerStartSession = (session: UpcomingSessionItem) => {
    const statusLower = (session.status || '').toLowerCase();
    if (statusLower === 'completed' || statusLower.includes('complete')) {
      router.push({
        pathname: '/(tabs)/dashboard/completed-class',
        params: {
          sessionId: session.id,
          id: session.id,
          title: session.title,
          batchName: session.title,
          from: 'dashboard',
        },
      } as any);
      return;
    }

    const batchIdNum = session.batchId || Number(session.id);
    setStartingSessionId(session.id);

    if (!isNaN(batchIdNum) && batchIdNum > 0) {
      startSessionMutation.mutate(
        { batch_id: batchIdNum },
        {
          onSuccess: (sessionData) => {
            setStartingSessionId(null);
            router.push({
              pathname: '/(tabs)/dashboard/start-class',
              params: {
                batchId: String(batchIdNum),
                title: session.title,
                sessionId: sessionData?.id ? String(sessionData.id) : undefined,
                sessionData: JSON.stringify(sessionData),
                from: 'dashboard',
              },
            } as any);
          },
          onError: (err) => {
            setStartingSessionId(null);
            const msg = getErrorMessage(err, 'Failed to start class session');
            setToast({ visible: true, message: msg, type: 'error' });
          },
        }
      );
    } else {
      setStartingSessionId(null);
      router.push({
        pathname: '/(tabs)/dashboard/start-class',
        params: { title: session.title, from: 'dashboard' },
      } as any);
    }
  };

  const handleStatusPress = (session: UpcomingSessionItem) => {
    if (onStatusPress) {
      onStatusPress(session);
    } else {
      triggerStartSession(session);
    }
  };

  const handleSessionPress = (session: UpcomingSessionItem) => {
    if (onSessionPress) {
      onSessionPress(session);
    }
  };

  return (
    <View style={style} className={`mt-[30px] ${className}`}>
      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header Row: Title & Date + View All Button */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 mr-3">
          <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight">
            Upcoming Sessions
          </Text>
          <Text className="text-[16px] font-urbanist-medium text-secondary mt-1">
            {displayDate}
          </Text>
        </View>

        <BtnCom label="View all" onClick={handleViewAll} />
      </View>

      {/* Filter Tabs */}
      <FiltersTabs
        tabs={['All', 'Morning', 'Afternoon', 'Evening', 'Completed', 'No Class']}
        activeTab={activeFilter}
        onSelectTab={setActiveFilter}
        scrollable={true}
        containerClassName="mb-4"
      />

      {/* Reusable Upcoming Sessions Cards */}
      <View className="gap-3.5">
        {filteredSessions.length > 0 ? (
          filteredSessions.slice(0, 3).map((session) => (
            <UpcomingSessionsCard
              key={session.id}
              title={session.title}
              time={session.time}
              studentsCount={session.studentsCount}
              status={session.status}
              statusLabel={session.statusLabel}
              loading={startingSessionId === session.id}
              onPressCard={onSessionPress ? () => handleSessionPress(session) : undefined}
              onStatusPress={() => handleStatusPress(session)}
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
