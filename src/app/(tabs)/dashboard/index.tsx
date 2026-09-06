import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Overview from '@/features/dashboard/Overview';
import UpcomingSessions from '@/features/dashboard/UpcomingSessions';
import PendingFee from '@/features/dashboard/PendingFee';
import React from 'react';
import { RefreshControl, View, TouchableOpacity } from 'react-native';
import Animated, { SlideInRight, Easing } from 'react-native-reanimated';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import { router } from 'expo-router';
import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/api/students.api';
import { batchesApi } from '@/api/batches.api';
import { feesApi } from '@/api/fees.api';
import { STUDENT_QUERY_KEYS } from '@/hooks/use-students';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const { handleScroll, showTabBar } = useTabBarVisibility();
  const { data: dashboardData, isLoading, isRefetching, refetch } = useDashboard();

  // Background prefetch all other main tabs immediately on dashboard mount
  React.useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: STUDENT_QUERY_KEYS.page,
      queryFn: () => studentsApi.getStudentsPage(),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ['batches', 'page'],
      queryFn: () => batchesApi.getBatchesPage(),
      staleTime: 1000 * 60 * 5,
    });
    queryClient.prefetchQuery({
      queryKey: ['fees', 'page'],
      queryFn: () => feesApi.getFeesPage(),
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  // Also prefetch batch students for upcoming sessions
  React.useEffect(() => {
    if (dashboardData?.upcoming_sessions?.sessions) {
      dashboardData.upcoming_sessions.sessions.forEach((s) => {
        const bId = s.batch_id || s.id;
        if (bId) {
          queryClient.prefetchQuery({
            queryKey: ['batches', 'students', String(bId)],
            queryFn: () => batchesApi.getBatchStudents(String(bId)),
            staleTime: 1000 * 60 * 5,
          });
        }
      });
    }
  }, [dashboardData?.upcoming_sessions?.sessions, queryClient]);

  useFocusEffect(
    React.useCallback(() => {
      showTabBar();
    }, [showTabBar])
  );

  const overview = dashboardData?.overview;
  const upcomingSessionsData = dashboardData?.upcoming_sessions;
  const pendingFeesData = dashboardData?.pending_fees;

  // Map API upcoming_sessions to UpcomingSessionItem[]
  const mappedSessions = (upcomingSessionsData?.sessions || []).map((s) => ({
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

  // Map API pending_fees to PendingFeeItem[]
  const mappedFees = (pendingFeesData?.fees || []).map((f) => ({
    id: String(f.id),
    studentName: f.student_name || '',
    batchName: f.batch_name || '',
    dueDate: f.due_date || '',
    amount: f.amount ? `₹${f.amount.toLocaleString('en-IN')}` : '',
    status: f.status || 'Overdue',
    phone: f.phone || '',
    avatarSource: f.avatar_uri || undefined,
  }));

  return (
    <Animated.View
      entering={SlideInRight.duration(300).easing(Easing.out(Easing.exp))}
      className="flex-1 bg-white"
    >
      <ScreenWrapper>
        <Header
          variant="profile"
          userName={authUser?.name || 'Instructor'}
          greeting="Welcome"
          avatarSource={authUser?.avatar || require('@/assets/images/home/dp.svg')}
          onAvatarPress={() => router.push('/(tabs)/settings')}
          onNotificationPress={() => router.push('/(tabs)/notifications')}
          hasUnreadNotifications={false}
          notificationCount={0}
        />

        {/* Tapping Search Bar navigates to dedicated Search Page */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => router.push('/(tabs)/dashboard/search' as any)}
        >
          <View pointerEvents="none">
            <Search
              placeholder="Search students, batches, sessions..."
              showFilter={false}
            />
          </View>
        </TouchableOpacity>

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
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#4186F7"
              colors={['#4186F7']}
            />
          }
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 140,
          }}
        >
          {isLoading && !dashboardData ? (
            <DashboardSkeleton />
          ) : (
            <>
              <Overview
                overview={overview}
                isLoading={isLoading && !dashboardData}
              />
              <UpcomingSessions
                date={upcomingSessionsData?.display_date || ''}
                sessions={mappedSessions}
              />
              <PendingFee
                amountText={pendingFeesData ? `₹${pendingFeesData.summary.total_amount.toLocaleString('en-IN')}` : '₹0'}
                studentsCountText={pendingFeesData ? `${pendingFeesData.summary.students_count} students` : '0 students'}
                fees={mappedFees}
              />
            </>
          )}
        </Animated.ScrollView>
      </ScreenWrapper>
    </Animated.View>
  );
}
