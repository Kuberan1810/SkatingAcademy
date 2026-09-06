import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, BackHandler, Text, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { Setting2, CalendarRemove } from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import FiltersTabs from '@/components/ui/FiltersTabs';
import UpcomingSessionsCard from '@/components/ui/UpcomingSessionsCard';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import styles from '@/styles/styles';
import { useStartSession } from '@/hooks/use-sessions';
import { getErrorMessage } from '@/utils/error';
import Toast from '@/components/ui/Toast';

export interface UpcomingSessionOverviewItem {
  id: string;
  batchId?: number;
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

const getFormattedTodayDate = (): string => {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

export default function UpcomingSessionsOverview({
  dateText: propDateText,
  sessions: propSessions,
  onBackPress,
  onSessionPress,
  onStatusPress,
}: UpcomingSessionsOverviewProps) {
  const { data: dashboardData, isLoading, refetch } = useDashboard();
  const startSessionMutation = useStartSession();

  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' | 'info' | 'delete' }>({
    visible: false,
    message: '',
    type: 'error',
  });

  useEffect(() => {
    const backAction = () => {
      if (onBackPress) {
        onBackPress();
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/dashboard' as any);
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBackPress]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const apiSessionsList: UpcomingSessionOverviewItem[] = useMemo(() => {
    if (!dashboardData?.upcoming_sessions?.sessions) return propSessions || [];
    return dashboardData.upcoming_sessions.sessions.map((s) => ({
      id: String(s.id),
      batchId: s.batch_id ? Number(s.batch_id) : Number(s.id),
      title: s.batch_name || s.location || (s as any).title || 'Session',
      time: s.time || (s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : ''),
      studentsCount: typeof s.students_count === 'number' ? `${s.students_count} Students` : s.students_count || '0 Students',
      status:
        s.status === 'completed'
          ? 'completed'
          : s.status === 'no_class' || s.status === 'noclass'
          ? 'no_class'
          : 'start',
      timeOfDay: (s.time_of_day || 'Morning') as 'Morning' | 'Afternoon' | 'Evening',
    }));
  }, [dashboardData?.upcoming_sessions?.sessions, propSessions]);

  const todayFormatted = useMemo(() => getFormattedTodayDate(), []);
  const displayDateText = dashboardData?.upcoming_sessions?.display_date || propDateText || todayFormatted;

  const filteredSessions = useMemo(() => {
    return apiSessionsList.filter((session) => {
      const matchesSearch =
        !searchQuery.trim() ||
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.studentsCount.toLowerCase().includes(searchQuery.toLowerCase());

      const statusLower = (session.status || '').toLowerCase();
      const isNoClass =
        statusLower === 'no_class' ||
        statusLower === 'noclass' ||
        statusLower === 'no class';
      const isCompleted =
        statusLower === 'completed' ||
        statusLower.includes('complete');

      let matchesTab = true;
      if (activeFilter === 'All') {
        matchesTab = true;
      } else if (activeFilter === 'Completed') {
        matchesTab = isCompleted;
      } else if (activeFilter === 'No Class') {
        matchesTab = isNoClass;
      } else {
        matchesTab = session.timeOfDay === activeFilter;
      }

      return matchesSearch && matchesTab;
    });
  }, [apiSessionsList, searchQuery, activeFilter]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/dashboard' as any);
    }
  };

  const triggerStartSession = (session: UpcomingSessionOverviewItem) => {
    const statusLower = (session.status || '').toLowerCase();
    if (statusLower === 'completed' || statusLower.includes('complete')) {
      router.push({
        pathname: '/(tabs)/dashboard/completed-class',
        params: {
          sessionId: session.id,
          id: session.id,
          title: session.title,
          batchName: session.title,
          from: 'upcoming-sessions',
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
                from: 'upcoming-sessions',
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
        params: { title: session.title, from: 'upcoming-sessions' },
      } as any);
    }
  };

  const handleStartOrStatus = (session: UpcomingSessionOverviewItem) => {
    if (onStatusPress) {
      onStatusPress(session);
    } else {
      triggerStartSession(session);
    }
  };

  const handleCardPress = (session: UpcomingSessionOverviewItem) => {
    if (onSessionPress) {
      onSessionPress(session);
    }
  };

  return (
    <ScreenWrapper>
      {/* Toast Banner */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header with Back, Title, Date Subtitle, and Settings Icon */}
      <Header
        variant="page"
        title="Upcoming Sessions"
        subtitle={displayDateText}
        showBack={true}
        onBackPress={handleBack}
        rightIcon={<Setting2 size={24} color="#626262" variant="Linear" />}
        onRightPress={() => router.push('/(tabs)/settings')}
      />

      {/* Search Input */}
      <View className="px-5 mt-2">
        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search sessions..."
          showFilter={false}
        />
      </View>

      {/* Filter Tabs (All, Morning, Afternoon, Evening, No Class) */}
      <View className="px-5 my-4">
        <FiltersTabs
          tabs={['All', 'Morning', 'Afternoon', 'Evening', 'Completed', 'No Class']}
          activeTab={activeFilter}
          onSelectTab={setActiveFilter}
          scrollable={true}
        />
      </View>

      {/* Sessions List */}
      <Animated.ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#4186F7"
            colors={['#4186F7']}
          />
        }
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
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <UpcomingSessionsCard
                key={session.id}
                title={session.title}
                time={session.time}
                studentsCount={session.studentsCount}
                status={session.status}
                statusLabel={session.statusLabel}
                loading={startingSessionId === session.id}
                onPressCard={onSessionPress ? () => handleCardPress(session) : undefined}
                onStatusPress={() => handleStartOrStatus(session)}
              />
            ))
          ) : (
            <View style={styles.BoxStyle} className="py-8 items-center justify-center">
              <View style={styles.IconStyle} className="mb-2 p-2.5">
                <CalendarRemove size={24} color="#8A8A8E" variant="Linear" />
              </View>
              <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
                No upcoming sessions
              </Text>
              <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
                There are no sessions scheduled for this filter.
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
