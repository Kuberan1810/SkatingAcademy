import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Linking, BackHandler, RefreshControl, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { ExportSquare, Card, CalendarRemove, Profile2User, Moneys } from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import FiltersTabs from '@/components/ui/FiltersTabs';
import StatsCard from '@/components/ui/StatsCard';
import PendingFeeCard, { PendingFeeCardProps } from '@/components/ui/PendingFeeCard';
import styles from '@/styles/styles';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import { usePendingFees } from '@/hooks/use-fees';
import { useIncrementalList } from '@/hooks/use-incremental-list';
import SkeletonItem, { OverviewSkeleton, FeeCardSkeleton } from '@/components/ui/Skeleton';

export interface PendingFeeOverviewItem extends PendingFeeCardProps {
  id: string;
  studentId?: string;
  category?: 'Due Today' | 'Overdue' | 'Tomorrow' | 'Upcoming';
}

export interface PendingFeeOverviewProps {
  screenTitle?: string;
  subtitle?: string;
  totalPendingAmount?: string;
  totalStudentsCount?: string;
  overdueAmount?: string;
  overdueCount?: string;
  dueTodayAmount?: string;
  dueTodayCount?: string;
  upcomingAmount?: string;
  upcomingCount?: string;
  fees?: PendingFeeOverviewItem[];
  onBackPress?: () => void;
  onFeeItemPress?: (item: PendingFeeOverviewItem) => void;
  onCallPress?: (item: PendingFeeOverviewItem) => void;
  onCollectPress?: (item: PendingFeeOverviewItem) => void;
  onExportPress?: () => void;
}

export default function PendingFeeOverview({
  screenTitle = 'Pending Fee Collection',
  subtitle,
  totalPendingAmount: propTotalPendingAmount,
  totalStudentsCount: propTotalStudentsCount,
  overdueAmount: propOverdueAmount,
  overdueCount: propOverdueCount,
  dueTodayAmount: propDueTodayAmount,
  dueTodayCount: propDueTodayCount,
  upcomingAmount: propUpcomingAmount,
  upcomingCount: propUpcomingCount,
  fees: propFees,
  onBackPress,
  onFeeItemPress,
  onCallPress,
  onCollectPress,
  onExportPress,
}: PendingFeeOverviewProps) {
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const tabs = ['All', 'Due Today', 'Overdue', 'Tomorrow', 'Upcoming'];

  const apiStatus = useMemo(() => {
    switch (activeFilter) {
      case 'Due Today':
        return 'due_today';
      case 'Overdue':
        return 'overdue';
      case 'Tomorrow':
        return 'tomorrow';
      case 'Upcoming':
        return 'upcoming';
      default:
        return 'all';
    }
  }, [activeFilter]);

  const {
    data: pendingFeesData,
    isLoading: isPendingFeesLoading,
    refetch: refetchPendingFees,
  } = usePendingFees(apiStatus, searchQuery);

  // Map API pending_fees to PendingFeeOverviewItem[]
  const apiPendingFeesList: PendingFeeOverviewItem[] = useMemo(() => {
    if (!pendingFeesData?.fees) return propFees || [];
    return pendingFeesData.fees.map((f) => ({
      id: String(f.id),
      studentId: String(f.id),
      studentName: f.student_name || '',
      batchName: f.batch_name || '',
      dueDate: f.due_date || '',
      amount: f.amount ? `₹${f.amount.toLocaleString('en-IN')}` : '',
      status: f.status || 'Overdue',
      phone: f.phone || '',
      avatarSource: f.avatar_uri || undefined,
    }));
  }, [pendingFeesData?.fees, propFees]);

  // Compute Overview Cards metrics dynamically from API summary
  const summaryMetrics = useMemo(() => {
    const summary = pendingFeesData?.summary;

    const displayTotalPendingAmount = summary?.total_pending_amount !== undefined
      ? `₹${summary.total_pending_amount.toLocaleString('en-IN')}`
      : propTotalPendingAmount || '₹0';

    const displayTotalStudentsCount = summary?.total_students_count !== undefined
      ? String(summary.total_students_count)
      : propTotalStudentsCount || String(apiPendingFeesList.length);

    const displayOverdueAmount = summary?.overdue_amount !== undefined
      ? `₹${summary.overdue_amount.toLocaleString('en-IN')}`
      : propOverdueAmount || '₹0';

    const displayOverdueCount = summary?.overdue_count !== undefined
      ? String(summary.overdue_count)
      : propOverdueCount || '0';

    const displayDueTodayAmount = summary?.due_today_amount !== undefined
      ? `₹${summary.due_today_amount.toLocaleString('en-IN')}`
      : propDueTodayAmount || '₹0';

    const displayDueTodayCount = summary?.due_today_count !== undefined
      ? String(summary.due_today_count)
      : propDueTodayCount || '0';

    const displayUpcomingAmount = summary?.upcoming_amount !== undefined
      ? `₹${summary.upcoming_amount.toLocaleString('en-IN')}`
      : propUpcomingAmount || '₹0';

    const displayUpcomingCount = summary?.upcoming_count !== undefined
      ? String(summary.upcoming_count)
      : propUpcomingCount || '0';

    return {
      displayTotalPendingAmount,
      displayTotalStudentsCount,
      displayOverdueAmount,
      displayOverdueCount,
      displayDueTodayAmount,
      displayDueTodayCount,
      displayUpcomingAmount,
      displayUpcomingCount,
    };
  }, [
    pendingFeesData?.summary,
    apiPendingFeesList.length,
    propTotalPendingAmount,
    propTotalStudentsCount,
    propOverdueAmount,
    propOverdueCount,
    propDueTodayAmount,
    propDueTodayCount,
    propUpcomingAmount,
    propUpcomingCount,
  ]);

  // Manage tab bar visibility for dedicated full-page experience
  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  // Handle hardware back press on Android
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBackPress]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/dashboard/index' as any);
    }
  };

  const filteredFees = apiPendingFeesList;

  const {
    displayedItems: displayedPendingFees,
    hasMore: hasMorePendingFees,
    onScroll: onIncrementalScroll,
  } = useIncrementalList({
    items: apiPendingFeesList,
    pageSize: 8,
    isLoading: isPendingFeesLoading,
  });

  const handleCallItem = (item: PendingFeeOverviewItem) => {
    if (onCallPress) {
      onCallPress(item);
    } else {
      const num = item.phone || item.phoneNumber;
      if (num) {
        Linking.openURL(`tel:${num}`);
      }
    }
  };

  const handleCollect = (item: PendingFeeOverviewItem) => {
    if (onCollectPress) {
      onCollectPress(item);
    } else {
      const studentForCollect = {
        id: item.studentId || item.id,
        name: item.studentName,
        studentId: item.studentId || `ID: SA-2024-${(item.id || '1').toString().padStart(4, '0')}`,
        location: item.batchName || 'Sathya Stadium',
        dueAmount: typeof item.amount === 'number' ? `₹${item.amount.toLocaleString('en-IN')}` : (item.amount || '₹1,200'),
        dueLabel: item.status || 'Due Today',
        avatar: item.avatarSource,
      };

      router.push({
        pathname: '/(tabs)/dashboard/CollectFee' as any,
        params: {
          studentData: JSON.stringify(studentForCollect),
          from: 'pending-fees',
        },
      });
    }
  };

  const handleItemPress = (item: PendingFeeOverviewItem) => {
    if (onFeeItemPress) {
      onFeeItemPress(item);
    } else {
      const statusUpper = (item.status || '').toUpperCase();
      const feeStatus = statusUpper.includes('OVERDUE') ? 'OVERDUE' : 'PENDING';
      const formattedAmount =
        typeof item.amount === 'number' ? `₹${item.amount.toLocaleString('en-IN')}` : item.amount;

      const studentProfileData = {
        id: item.studentId || item.id,
        name: item.studentName,
        avatar: item.avatarSource,
        joinedDate: '10 Jul 2026',
        location: item.batchName || 'Sathya Stadium',
        attendancePercent: '88%',
        parentInfo: {
          parentName: 'Parent of ' + item.studentName.split(' ')[0],
          phone: item.phone || item.phoneNumber || '+91 96009 27801',
          emergency: '+91 98765 43211',
        },
        personalInfo: {
          gender: 'Male',
          dob: '2012-05-14',
          bloodGroup: 'O+ Positive',
          address: 'No. 12, Anna Nagar, Chennai, Tamil Nadu - 600040',
        },
        feeInfo: {
          monthlyFee: formattedAmount,
          pending: formattedAmount,
          status: feeStatus as 'PENDING' | 'OVERDUE' | 'PAID',
        },
        attendanceStats: {
          present: 22,
          absent: 2,
          attendancePercent: '88%',
          scheduledDaysCount: 24,
        },
        attendanceGrid: [
          { dayName: 'Sun', dayNumber: '19', fullDate: '2026-10-19', status: 'present' },
          { dayName: 'Mon', dayNumber: '20', fullDate: '2026-10-20', status: 'present' },
          { dayName: 'Tue', dayNumber: '21', fullDate: '2026-10-21', status: 'present' },
          { dayName: 'Wed', dayNumber: '22', fullDate: '2026-10-22', status: 'absent' },
          { dayName: 'Thu', dayNumber: '23', fullDate: '2026-10-23', status: 'present' },
          { dayName: 'Fri', dayNumber: '24', fullDate: '2026-10-24', status: 'present' },
          { dayName: 'Sat', dayNumber: '25', fullDate: '2026-10-25', status: 'present' },
        ],
        balanceSummary: {
          lastPaidAmount: '',
          lastPaidDate: '',
          nextPaymentAmount: formattedAmount,
          nextPaymentDueDate: item.dueDate || '',
          daysLeftText: item.status || '',
        },
        currentMonthFee: {
          monthYear: '',
          amount: formattedAmount,
          status: feeStatus === 'OVERDUE' ? 'overdue' : 'pending',
          statusSubtext: item.dueDate ? `Due: ${item.dueDate}` : '',
          paymentDetails: feeStatus === 'OVERDUE' ? 'Over due' : 'Pending',
        },
        transactions: [],
      };

      router.push({
        pathname: '/(tabs)/dashboard/student-profile',
        params: {
          id: item.studentId || item.id,
          studentData: JSON.stringify(studentProfileData),
          from: 'pending-fees',
        },
      } as any);
    }
  };

  const headerSubtitle = subtitle || `${summaryMetrics.displayTotalPendingAmount} across ${summaryMetrics.displayTotalStudentsCount} students`;

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <Header
        variant="page"
        title={screenTitle}
        subtitle={headerSubtitle}
        showBack={true}
        onBackPress={handleBack}
        rightIcon={ExportSquare}
        onRightPress={() => {
          if (onExportPress) {
            onExportPress();
          } else {
            console.log('Export Pending Fees list');
          }
        }}
      />

      {/* Search Input Bar */}
      <View className="mb-4">
        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search student, batch, phone..."
          showFilter={false}
        />
      </View>

      {/* Main Scroll Content */}
      <Animated.ScrollView
        onScroll={(e) => {
          handleScroll(e);
          onIncrementalScroll(e);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isPendingFeesLoading}
            onRefresh={refetchPendingFees}
            tintColor="#4186F7"
            colors={['#4186F7']}
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 120,
        }}
      >
        {isPendingFeesLoading && !pendingFeesData ? (
          <View className="pt-2">
            <OverviewSkeleton />
            <SkeletonItem height={24} width={180} borderRadius={6} className="mb-4 mt-2" />
            <View className="gap-3">
              <FeeCardSkeleton />
              <FeeCardSkeleton />
              <FeeCardSkeleton />
              <FeeCardSkeleton />
            </View>
          </View>
        ) : (
          <>
            {/* Overview Stat Cards Section */}
            <Text className="text-[20px] font-urbanist-bold text-primary mb-3 tracking-tight">
              Overview
            </Text>
            <View className="flex-row flex-wrap -mx-1.5 mb-6">
              <View className="w-1/2 px-1.5 mb-3">
                <StatsCard
                  variant="blue"
                  title="Total Pending"
                  value={summaryMetrics.displayTotalPendingAmount}
                  subtitle={`${summaryMetrics.displayTotalStudentsCount} Students Due`}
                />
              </View>
              <View className="w-1/2 px-1.5 mb-3">
                <StatsCard
                  variant="peach"
                  title="Overdue"
                  value={summaryMetrics.displayOverdueAmount}
                  subtitle={`${summaryMetrics.displayOverdueCount} Students Overdue`}
                />
              </View>
              <View className="w-1/2 px-1.5">
                <StatsCard
                  variant="purple"
                  title="Due Today"
                  value={summaryMetrics.displayDueTodayAmount}
                  subtitle={`${summaryMetrics.displayDueTodayCount} Due Today`}
                />
              </View>
              <View className="w-1/2 px-1.5">
                <StatsCard
                  variant="green"
                  title="Upcoming"
                  value={summaryMetrics.displayUpcomingAmount}
                  subtitle={`${summaryMetrics.displayUpcomingCount} Upcoming`}
                />
              </View>
            </View>

            {/* Pending Student List Section */}
            <Text className="text-[20px] font-urbanist-bold text-primary mb-3 tracking-tight">
              Pending Students ({apiPendingFeesList.length})
            </Text>

            {/* Filter Tabs */}
            <FiltersTabs
              tabs={tabs}
              activeTab={activeFilter}
              onSelectTab={setActiveFilter}
              scrollable={true}
              containerClassName="mb-4"
            />

            {/* Pending Fee Cards List */}
            <View className="gap-4">
              {displayedPendingFees.length > 0 ? (
                <>
                  {displayedPendingFees.map((item) => (
                    <PendingFeeCard
                      key={item.id}
                      studentName={item.studentName}
                      batchName={item.batchName}
                      dueDate={item.dueDate}
                      amount={item.amount}
                      phone={item.phone}
                      phoneNumber={item.phoneNumber}
                      status={item.status}
                      statusLabel={item.statusLabel}
                      avatarSource={item.avatarSource}
                      onPressCard={() => handleItemPress(item)}
                      onCallPress={() => handleCallItem(item)}
                      onCollectPress={() => handleCollect(item)}
                    />
                  ))}
                  {hasMorePendingFees && (
                    <View className="py-4 flex-row items-center justify-center gap-2">
                      <ActivityIndicator size="small" color="#8A8A8E" />
                      <Text className="text-[13px] font-urbanist-medium text-secondary">
                        Loading more students...
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.BoxStyle} className="py-10 items-center justify-center">
                  <View style={styles.IconStyle} className="mb-2 p-2.5">
                    <Card size={24} color="#8A8A8E" variant="Linear" />
                  </View>
                  <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
                    No Pending Fees
                  </Text>
                  <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
                    There are no pending student fee records in this category.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
