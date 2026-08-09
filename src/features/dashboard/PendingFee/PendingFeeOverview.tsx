import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Linking, BackHandler } from 'react-native';
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

const DEFAULT_PENDING_FEES: PendingFeeOverviewItem[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Marcus Thorne',
    batchName: 'Morning Batch A',
    dueDate: 'Oct 15, 2026',
    amount: '₹1,200',
    status: 'Overdue',
    phone: '+919600927801',
    category: 'Overdue',
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Kavitha Subramanian',
    batchName: 'Don Bosco Evening',
    dueDate: 'Oct 20, 2026',
    amount: '₹2,500',
    status: 'Due Today',
    phone: '+917550364255',
    category: 'Due Today',
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Rahul Sharma',
    batchName: 'Sathya Stadium',
    dueDate: 'Oct 22, 2026',
    amount: '₹1,800',
    status: 'Overdue',
    phone: '+919876543210',
    category: 'Overdue',
  },
  {
    id: '4',
    studentId: '4',
    studentName: 'Ananya Verma',
    batchName: 'Beginners Batch',
    dueDate: 'Oct 25, 2026',
    amount: '₹2,400',
    status: 'Due Today',
    phone: '+919876543211',
    category: 'Due Today',
  },
  {
    id: '5',
    studentId: '5',
    studentName: 'Vikram Singh',
    batchName: 'Weekend Pro',
    dueDate: 'Oct 26, 2026',
    amount: '₹1,500',
    status: 'Tomorrow',
    phone: '+919876543212',
    category: 'Tomorrow',
  },
  {
    id: '6',
    studentId: '6',
    studentName: 'Priya Patel',
    batchName: 'Don Bosco Evening',
    dueDate: 'Oct 28, 2026',
    amount: '₹3,200',
    status: 'Overdue',
    phone: '+919876543213',
    category: 'Overdue',
  },
  {
    id: '7',
    studentId: '7',
    studentName: 'Rohan Mehta',
    batchName: 'Morning Batch A',
    dueDate: 'Oct 30, 2026',
    amount: '₹6,000',
    status: 'Overdue',
    phone: '+919876543214',
    category: 'Overdue',
  },
];

export default function PendingFeeOverview({
  screenTitle = 'Pending Fee Collection',
  subtitle,
  totalPendingAmount = '₹18,600',
  totalStudentsCount = '7',
  overdueAmount = '₹12,200',
  overdueCount = '4',
  dueTodayAmount = '₹4,900',
  dueTodayCount = '2',
  upcomingAmount = '₹1,500',
  upcomingCount = '1',
  fees = DEFAULT_PENDING_FEES,
  onBackPress,
  onFeeItemPress,
  onCallPress,
  onCollectPress,
  onExportPress,
}: PendingFeeOverviewProps) {
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const tabs = ['All', 'Due Today', 'Overdue', 'Tomorrow'];

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

  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        fee.studentName.toLowerCase().includes(q) ||
        fee.batchName?.toLowerCase().includes(q) ||
        fee.phone?.includes(q) ||
        fee.phoneNumber?.includes(q);

      const statusLower = (fee.status || '').toLowerCase();
      let matchesTab = true;

      if (activeFilter === 'Due Today') {
        matchesTab = statusLower.includes('today') || fee.category === 'Due Today';
      } else if (activeFilter === 'Overdue') {
        matchesTab = statusLower.includes('overdue') || fee.category === 'Overdue';
      } else if (activeFilter === 'Tomorrow') {
        matchesTab = statusLower.includes('tomorrow') || fee.category === 'Tomorrow';
      }

      return matchesSearch && matchesTab;
    });
  }, [fees, searchQuery, activeFilter]);

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
      router.push('/(tabs)/fees/CollectFee' as any);
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
          lastPaidAmount: '₹1,250',
          lastPaidDate: '05 Sep 2026',
          nextPaymentAmount: formattedAmount,
          nextPaymentDueDate: item.dueDate || '15 Oct 2026',
          daysLeftText: item.status || 'Due Soon',
        },
        currentMonthFee: {
          monthYear: 'OCTOBER 2026',
          amount: formattedAmount,
          status: feeStatus === 'OVERDUE' ? 'overdue' : 'pending',
          statusSubtext: `Due: ${item.dueDate || '15 Oct 2026'}`,
          paymentDetails: feeStatus === 'OVERDUE' ? 'Over due' : 'Pending',
        },
        transactions: [
          {
            id: 'tx1',
            title: 'September Fee',
            dateAndMethod: '05 Sep 2026 • UPI',
            amount: '₹1,250',
            status: 'PAID',
          },
          {
            id: 'tx2',
            title: 'August Fee',
            dateAndMethod: '04 Aug 2026 • Cash',
            amount: '₹1,250',
            status: 'PAID',
          },
        ],
      };

      router.push({
        pathname: '/(tabs)/dashboard/student-profile',
        params: {
          id: item.studentId || item.id,
          studentData: JSON.stringify(studentProfileData),
        },
      } as any);
    }
  };

  const headerSubtitle = subtitle || `${totalPendingAmount} across ${totalStudentsCount} students`;

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 120,
        }}
      >
        {/* Overview Stat Cards Section */}
        <Text className="text-[20px] font-urbanist-bold text-primary mb-3 tracking-tight">
          Overview
        </Text>
        <View className="flex-row flex-wrap -mx-1.5 mb-6">
          <View className="w-1/2 px-1.5 mb-3">
            <StatsCard
              variant="blue"
              title="Total Pending"
              value={totalPendingAmount}
              subtitle={`${totalStudentsCount} Students Due`}
            />
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <StatsCard
              variant="peach"
              title="Overdue"
              value={overdueAmount}
              subtitle={`${overdueCount} Students Overdue`}
            />
          </View>
          <View className="w-1/2 px-1.5">
            <StatsCard
              variant="purple"
              title="Due Today"
              value={dueTodayAmount}
              subtitle={`${dueTodayCount} Due Today`}
            />
          </View>
          <View className="w-1/2 px-1.5">
            <StatsCard
              variant="green"
              title="Upcoming"
              value={upcomingAmount}
              subtitle={`${upcomingCount} Tomorrow`}
            />
          </View>
        </View>

        {/* Pending Student List Section */}
        <Text className="text-[20px] font-urbanist-bold text-primary mb-3 tracking-tight">
          Pending Students ({filteredFees.length})
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
          {filteredFees.length > 0 ? (
            filteredFees.map((item) => (
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
            ))
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
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
