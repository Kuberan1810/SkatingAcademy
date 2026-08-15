import React, { useMemo, useState } from 'react';
import { View, Text, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Layer, ExportSquare, User } from 'iconsax-react-native';
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
import SortBottomSheet, { SortOptionItem } from '@/components/ui/SortBottomSheet';
import { FeeCardSkeleton } from '@/components/ui/Skeleton';
import { useIncrementalList } from '@/hooks/use-incremental-list';

const SORT_OPTIONS: SortOptionItem[] = [
  { id: 'recent', label: 'Recently Added' },
  { id: 'name_asc', label: 'Student Name', subtitle: 'A to Z' },
  { id: 'name_desc', label: 'Student Name', subtitle: 'Z to A' },
  { id: 'amount_high', label: 'Amount', subtitle: 'High to Low' },
  { id: 'amount_low', label: 'Amount', subtitle: 'Low to High' },
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
  isLoading?: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  onBackPress?: () => void;
  onStudentPress?: (student: FeeStudentListItem) => void;
  onCollectFeePress?: (student: FeeStudentListItem) => void;
  onViewAllStudents?: () => void;
  onViewAllRecentPayments?: () => void;
}

export default function FeeOverview({
  screenTitle = 'Fee Overview',
  students = [],
  recentPayments = [],
  totalStudentsCount = '0',
  todayCollectionCount = '0',
  totalCollectionTarget = '0',
  pendingFeesAmount = '₹0',
  thisMonthAmount = '₹0',
  isLoading = false,
  isRefetching = false,
  onRefresh,
  onBackPress,
  onStudentPress,
  onCollectFeePress,
  onViewAllStudents,
  onViewAllRecentPayments,
}: FeeOverviewProps) {
  const { handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FeeFilterTab>('All');
  const [sortBy, setSortBy] = useState('recent');
  const [isSortVisible, setIsSortVisible] = useState(false);

  const tabs: FeeFilterTab[] = ['All', 'Paid', 'Unpaid', 'Overdue'];

  const filteredStudents = useMemo(() => {
    let result = [...students];

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

    // Apply sorting
    const parseAmount = (amountStr: string) => parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;

    switch (sortBy) {
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'amount_high':
        result.sort((a, b) => parseAmount(b.amount || '') - parseAmount(a.amount || ''));
        break;
      case 'amount_low':
        result.sort((a, b) => parseAmount(a.amount || '') - parseAmount(b.amount || ''));
        break;
      case 'recent':
      default:
        break;
    }

    return result;
  }, [students, activeTab, searchQuery, sortBy]);

  const {
    displayedItems: displayedStudents,
    hasMore: hasMoreStudents,
    onScroll: onIncrementalScroll,
  } = useIncrementalList({
    items: filteredStudents,
    pageSize: 5,
    isLoading,
  });

  const overviewDisplayedStudents = useMemo(() => {
    return displayedStudents.slice(0, 5);
  }, [displayedStudents]);

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
        rightIcon={ExportSquare}
        onRightPress={() => {
          console.log('Export pressed');
        }}
      />

      {/* Search Bar */}
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search students, batches..."
        showFilter={true}
        onFilterPress={() => setIsSortVisible(true)}
      />

      {/* Main Scroll Content */}
      <Animated.ScrollView
        onScroll={(e) => {
          handleScroll(e);
          onIncrementalScroll(e);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        decelerationRate={0.998}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor="#4186F7"
            />
          ) : undefined
        }
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
              subtitle="Enrolled Students"
            />
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <StatsCard
              variant="peach"
              title="Today's Collection"
              value={todayCollectionCount}
              valueSuffix={totalCollectionTarget ? `/ ${totalCollectionTarget}` : undefined}
              subtitle="Collection Target"
            />
          </View>
          <View className="w-1/2 px-1.5">
            <StatsCard
              variant="blue"
              title="Pending Fees"
              value={pendingFeesAmount}
              subtitle="Total Overdue / Pending"
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
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-[22px] font-urbanist-bold text-primary tracking-tight">
            Student List
          </Text>
          <BtnCom
            label="View All"
            onClick={() => {
              if (onViewAllStudents) {
                onViewAllStudents();
              } else {
                router.push('/(tabs)/fees/student-list' as any);
              }
            }}
          />
        </View>

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
          {isLoading ? (
            <View>
              <FeeCardSkeleton />
              <FeeCardSkeleton />
              <FeeCardSkeleton />
            </View>
          ) : filteredStudents.length > 0 ? (
            <>
              {overviewDisplayedStudents.map((student) => (
                <FeeStudentCard
                  key={student.id}
                  student={student}
                  onPress={onStudentPress}
                  onCollectPress={
                    onCollectFeePress
                      ? () => onCollectFeePress(student)
                      : () => {
                          const studentForCollect = {
                            id: student.id,
                            name: student.name,
                            studentId: `ID: SA-2024-${(student.id || '1').toString().padStart(4, '0')}`,
                            location: student.location || 'Batch',
                            dueAmount: student.amount || '₹1,250',
                            dueLabel: 'Due Amount',
                          };
                          router.push({
                            pathname: '/(tabs)/fees/CollectFee' as any,
                            params: { studentData: JSON.stringify(studentForCollect) },
                          });
                        }
                  }
                />
              ))}
              {filteredStudents.length > 5 && (
                <View className="py-2 flex-row items-center justify-end">
                  <TouchableOpacity
                    style={[styles.BlackInnerShadowStyle]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (onViewAllStudents) {
                        onViewAllStudents();
                      } else {
                        router.push('/(tabs)/fees/student-list' as any);
                      }
                    }}
                    className="bg-[#FFFFFF] border border-primary-border rounded-[18px] px-4 py-2.5 justify-center items-center"
                  >
                    <Text className="text-[12px] font-urbanist-medium text-secondary tracking-tight">
                      View All ({filteredStudents.length} Students)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
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
          {recentPayments.length > 0 ? (
            recentPayments.map((item) => (
              <RecentPaymentCard key={item.id} item={item} />
            ))
          ) : (
            <View style={styles.BoxStyle} className="py-8 items-center justify-center my-4">
              <View style={styles.IconStyle} className="mb-2 p-2.5">
                <User size={24} color="#8A8A8E" variant="Linear" />
              </View>
              <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
                No Recent Fee Payments
              </Text>
              <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
                No payments have been received yet.
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <SortBottomSheet
        visible={isSortVisible}
        options={SORT_OPTIONS}
        selectedOptionId={sortBy}
        onSelectOption={(id) => {
          setSortBy(id);
          setIsSortVisible(false);
        }}
        onClose={() => setIsSortVisible(false)}
      />
    </ScreenWrapper>
  );
}
