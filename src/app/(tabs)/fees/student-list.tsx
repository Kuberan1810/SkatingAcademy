import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import FiltersTabs from '@/components/ui/FiltersTabs';
import SortBottomSheet, { SortOptionItem } from '@/components/ui/SortBottomSheet';
import { FeeCardSkeleton } from '@/components/ui/Skeleton';
import FeeStudentCard, { FeeStudentListItem } from '@/features/fees/FeeStudentCard';
import { useFeesPage } from '@/hooks/use-fees';
import { useIncrementalList } from '@/hooks/use-incremental-list';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import styles from '@/styles/styles';
import { User } from 'iconsax-react-native';

const SORT_OPTIONS: SortOptionItem[] = [
  { id: 'recent', label: 'Recently Added' },
  { id: 'name_asc', label: 'Student Name', subtitle: 'A to Z' },
  { id: 'name_desc', label: 'Student Name', subtitle: 'Z to A' },
  { id: 'amount_high', label: 'Amount', subtitle: 'High to Low' },
  { id: 'amount_low', label: 'Amount', subtitle: 'Low to High' },
];

export type FeeFilterTab = 'All' | 'Paid' | 'Unpaid' | 'Overdue';

export default function FeeStudentListScreen() {
  const { handleScroll } = useTabBarVisibility();
  const { data: feeData, isLoading } = useFeesPage();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FeeFilterTab>('All');
  const [sortBy, setSortBy] = useState('recent');
  const [isSortVisible, setIsSortVisible] = useState(false);

  const tabs: FeeFilterTab[] = ['All', 'Paid', 'Unpaid', 'Overdue'];

  const mappedStudents: FeeStudentListItem[] = useMemo(() => {
    if (!feeData?.students) return [];
    return feeData.students.map((s) => ({
      id: String(s.id),
      name: s.name,
      location: s.batch_name || s.location || 'Batch',
      phone: s.phone || '',
      paymentStatus: (s.payment_status?.toLowerCase() as any) || 'overdue',
      amount: s.amount ? `₹${s.amount.toLocaleString('en-IN')}` : '₹1,250',
      paidDate: s.paid_date || undefined,
    }));
  }, [feeData?.students]);

  const filteredStudents = useMemo(() => {
    let result = [...mappedStudents];

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
          s.location?.toLowerCase().includes(q) ||
          s.phone?.includes(q)
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
  }, [mappedStudents, activeTab, searchQuery, sortBy]);

  const {
    displayedItems: displayedStudents,
    hasMore: hasMoreStudents,
    onScroll: onIncrementalScroll,
  } = useIncrementalList({
    items: filteredStudents,
    pageSize: 10,
    isLoading,
  });

  return (
    <ScreenWrapper>
      {/* Header */}
      <Header
        variant="page"
        title="Fee Student List"
        showBack={true}
        onBackPress={() => router.back()}
      />

      {/* Search Input Bar with Filter Button */}
      <View className="mb-4 pt-1">
        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search student name or batch..."
          showFilter={true}
          onFilterPress={() => setIsSortVisible(true)}
        />
      </View>

      <Animated.ScrollView
        onScroll={(e) => {
          handleScroll(e);
          onIncrementalScroll(e);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingBottom: 140,
        }}
      >
        {/* Filter Tabs */}
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
              {displayedStudents.map((student) => (
                <FeeStudentCard
                  key={student.id}
                  student={student}
                  onPress={(st) => {
                    router.push({
                      pathname: '/(tabs)/fees/student-profile',
                      params: { id: st.id, studentData: JSON.stringify(st) },
                    } as any);
                  }}
                  onCollectPress={(st) => {
                    const studentForCollect = {
                      id: st.id,
                      name: st.name,
                      studentId: `ID: SA-2024-${(st.id || '1').toString().padStart(4, '0')}`,
                      location: st.location || 'Batch',
                      dueAmount: st.amount || '₹1,250',
                      dueLabel: 'Due Amount',
                    };
                    router.push({
                      pathname: '/(tabs)/fees/CollectFee' as any,
                      params: { studentData: JSON.stringify(studentForCollect) },
                    });
                  }}
                />
              ))}
              {hasMoreStudents && (
                <View className="py-4 flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="#8A8A8E" />
                  <Text className="text-[13px] font-urbanist-medium text-secondary">
                    Loading more students...
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.BoxStyle} className="py-8 items-center justify-center">
              <View style={styles.IconStyle} className="mb-2 p-2.5">
                <User size={24} color="#8A8A8E" variant="Linear" />
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
      </Animated.ScrollView>

      {/* Sort Bottom Sheet */}
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
