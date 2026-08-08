import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { Setting2, Layer } from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import StatsCard from '@/components/ui/StatsCard';
import FiltersTabs from '@/components/ui/FiltersTabs';
import styles from '@/styles/styles';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import FeeStudentCard, { FeeStudentListItem } from './FeeStudentCard';
import RecentPaymentCard, { RecentPaymentItem } from './RecentPaymentCard';
import BtnCom from '@/components/ui/BtnCom';

const DEFAULT_FEE_STUDENTS: FeeStudentListItem[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    location: 'Sathya Stadium',
    phone: '+91 9876543210',
    paymentStatus: 'paid',
    amount: '₹1,200',
    paidDate: '12 Aug 2026',
  },
  {
    id: '2',
    name: 'Ananya Verma',
    location: 'Sathya Stadium',
    phone: '+91 9876543211',
    paymentStatus: 'paid',
    amount: '₹2,400',
    paidDate: '10 Aug 2026',
  },
  {
    id: '3',
    name: 'Vikram Singh',
    location: 'Sathya Stadium',
    phone: '+91 9876543212',
    paymentStatus: 'due_today',
    amount: '₹1,200',
  },
  {
    id: '4',
    name: 'Priya Patel',
    location: 'Sathya Stadium',
    phone: '+91 9876543213',
    paymentStatus: 'overdue',
    amount: '₹1,500',
  },
];

const DEFAULT_RECENT_PAYMENTS: RecentPaymentItem[] = [
  {
    id: 'p1',
    name: 'Rahul Sharma',
    timeAgoOrDate: '2 hr ago',
    paymentMethod: 'UPI',
    amount: '₹2,400',
  },
  {
    id: 'p2',
    name: 'Ananya Verma',
    timeAgoOrDate: '4 hr ago',
    paymentMethod: 'UPI',
    amount: '₹1,200',
  },
  {
    id: 'p3',
    name: 'Kavya Nair',
    timeAgoOrDate: '1 day ago',
    paymentMethod: 'CASH',
    amount: '₹3,600',
  },
  {
    id: 'p4',
    name: 'Rohan Mehta',
    timeAgoOrDate: '19/7/2026',
    paymentMethod: 'UPI',
    amount: '₹1,200',
  },
  {
    id: 'p5',
    name: 'Priya Patel',
    timeAgoOrDate: '18/7/2026',
    paymentMethod: 'CASH',
    amount: '₹2,400',
  },
];

export type FeeFilterTab = 'All' | 'Paid' | 'Unpaid' | 'Overdue';

export interface FeeOverviewProps {
  screenTitle?: string;
  students?: FeeStudentListItem[];
  recentPayments?: RecentPaymentItem[];
  totalStudentsCount?: string;
  todayCollectionCount?: string;
  totalCollectionTarget?: string;
  pendingFeesAmount?: string;
  thisMonthAmount?: string;
  onBackPress?: () => void;
  onStudentPress?: (student: FeeStudentListItem) => void;
  onCollectFeePress?: (student: FeeStudentListItem) => void;
  onViewAllRecentPayments?: () => void;
}

export default function FeeOverview({
  screenTitle = 'Sathya Stadium Fee',
  students = DEFAULT_FEE_STUDENTS,
  recentPayments = DEFAULT_RECENT_PAYMENTS,
  totalStudentsCount = '26',
  todayCollectionCount = '12',
  totalCollectionTarget = '26',
  pendingFeesAmount = '₹2,400',
  thisMonthAmount = '₹18,000',
  onBackPress,
  onStudentPress,
  onCollectFeePress,
  onViewAllRecentPayments,
}: FeeOverviewProps) {
  const { handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FeeFilterTab>('All');

  const tabs: FeeFilterTab[] = ['All', 'Paid', 'Unpaid', 'Overdue'];

  const filteredStudents = useMemo(() => {
    let result = students;

    // Filter by tab
    if (activeTab === 'Paid') {
      result = result.filter((s) => s.paymentStatus === 'paid');
    } else if (activeTab === 'Unpaid') {
      result = result.filter(
        (s) => s.paymentStatus === 'due_today' || s.paymentStatus === 'unpaid'
      );
    } else if (activeTab === 'Overdue') {
      result = result.filter((s) => s.paymentStatus === 'overdue');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [students, activeTab, searchQuery]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <Header
        variant="page"
        title={screenTitle}
        onBackPress={handleBack}
        rightIcon={Setting2}
        onRightPress={() => {
          console.log('Settings pressed');
        }}
      />

      {/* Search Bar */}
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search students, batches..."
        showFilter={true}
      />

      {/* Main Scroll Content */}
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        decelerationRate={0.998}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 120,
        }}
      >
        {/* Overview Section */}
        <Text className="text-[22px] font-urbanist-bold text-primary mb-3 tracking-tight">
          Overview
        </Text>
        <View className="flex-row flex-wrap -mx-1.5 mb-7">
          <View className="w-1/2 px-1.5 mb-3">
            <StatsCard
              variant="purple"
              title="Total Students"
              value={totalStudentsCount}
              subtitle="2 New This Month"
            />
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <StatsCard
              variant="peach"
              title="Today's Collection"
              value={todayCollectionCount}
              valueSuffix={totalCollectionTarget ? `/ ${totalCollectionTarget}` : undefined}
              subtitle="14 Student Remaining"
            />
          </View>
          <View className="w-1/2 px-1.5">
            <StatsCard
              variant="blue"
              title="Pending Fees"
              value={pendingFeesAmount}
              subtitle="2 Students Due"
            />
          </View>
          <View className="w-1/2 px-1.5">
            <StatsCard
              variant="green"
              title="This Month"
              value={thisMonthAmount}
              subtitle="Collected Fees"
            />
          </View>
        </View>

        {/* Student List Section */}
        <Text className="text-[22px] font-urbanist-bold text-primary mb-3 tracking-tight">
          Student List
        </Text>

        {/* Filter Tabs using reusable FiltersTabs component */}
        <View className="mb-4">
          <FiltersTabs
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={(tabId) => setActiveTab(tabId as FeeFilterTab)}
          />
        </View>

        {/* Student Cards List */}
        <View className="gap-3 mb-8">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <FeeStudentCard
                key={student.id}
                student={student}
                onPress={onStudentPress}
                onCollectPress={
                  onCollectFeePress ||
                  (() => router.push('/(tabs)/fees/CollectFee' as any))
                }
              />
            ))
          ) : (
            <View style={styles.BoxStyle} className="py-8 items-center justify-center">
              <View style={styles.IconStyle} className="mb-2 p-2.5">
                <Layer size={24} color="#8A8A8E" variant="Linear" />
              </View>
              <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
                No Students Found
              </Text>
              <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
                There are no students matching your selected filter.
              </Text>
            </View>
          )}
        </View>

        {/* Recent Payments Section Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[22px] font-urbanist-bold text-primary tracking-tight">
            Recent Payments
          </Text>

          <BtnCom
            label="View All"
            onClick={() => {
              if (onViewAllRecentPayments) {
                onViewAllRecentPayments();
              } else {
                router.push('/(tabs)/fees/recent-payments' as any);
              }
            }}
          />

        </View>

        {/* Recent Payment List */}
        <View className="gap-3">
          {recentPayments.map((item) => (
            <RecentPaymentCard key={item.id} item={item} />
          ))}
        </View>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
