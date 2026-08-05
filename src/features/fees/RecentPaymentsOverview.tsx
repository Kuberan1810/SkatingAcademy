import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { Setting2, Layer } from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import FiltersTabs from '@/components/ui/FiltersTabs';
import styles from '@/styles/styles';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import RecentPaymentCard, { RecentPaymentItem } from './RecentPaymentCard';

const EXTENDED_RECENT_PAYMENTS: RecentPaymentItem[] = [
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
  {
    id: 'p6',
    name: 'Vikram Singh',
    timeAgoOrDate: '17/7/2026',
    paymentMethod: 'UPI',
    amount: '₹1,200',
  },
  {
    id: 'p7',
    name: 'Aarav Patel',
    timeAgoOrDate: '15/7/2026',
    paymentMethod: 'CASH',
    amount: '₹2,400',
  },
  {
    id: 'p8',
    name: 'Meera Nair',
    timeAgoOrDate: '14/7/2026',
    paymentMethod: 'UPI',
    amount: '₹1,200',
  },
];

export type PaymentFilterTab = 'All' | 'UPI' | 'CASH';

export interface RecentPaymentsOverviewProps {
  screenTitle?: string;
  payments?: RecentPaymentItem[];
  onBackPress?: () => void;
  onPaymentPress?: (item: RecentPaymentItem) => void;
}

export default function RecentPaymentsOverview({
  screenTitle = 'Recent Payments',
  payments = EXTENDED_RECENT_PAYMENTS,
  onBackPress,
  onPaymentPress,
}: RecentPaymentsOverviewProps) {
  const { handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<PaymentFilterTab>('All');

  const tabs: PaymentFilterTab[] = ['All', 'UPI', 'CASH'];

  const filteredPayments = useMemo(() => {
    let result = payments;

    // Filter by tab
    if (activeTab === 'UPI') {
      result = result.filter((p) => p.paymentMethod.toUpperCase() === 'UPI');
    } else if (activeTab === 'CASH') {
      result = result.filter((p) => p.paymentMethod.toUpperCase() === 'CASH');
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.paymentMethod.toLowerCase().includes(q) ||
          p.amount.toLowerCase().includes(q)
      );
    }

    return result;
  }, [payments, activeTab, searchQuery]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/fees' as any);
    }
  };

  return (
    <ScreenWrapper>
      {/* Page Header */}
      <Header
        variant="page"
        title={screenTitle}
        onBackPress={handleBack}
        rightIcon={Setting2}
        onRightPress={() => {
          console.log('Settings pressed in Recent Payments');
        }}
      />

      {/* Search Input */}
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search payments, students..."
        showFilter={true}
      />

      {/* Scrollable List Content */}
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
        {/* Filter Tabs */}
        <View className="mb-4">
          <FiltersTabs
            tabs={tabs}
            activeTab={activeTab}
            onSelectTab={(tabId) => setActiveTab(tabId as PaymentFilterTab)}
          />
        </View>

        {/* Payments Card List */}
        <View className="gap-3">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((item) => (
              <RecentPaymentCard
                key={item.id}
                item={item}
                onPress={onPaymentPress}
              />
            ))
          ) : (
            <View style={styles.BoxStyle} className="py-8 items-center justify-center">
              <View style={styles.IconStyle} className="mb-2 p-2.5">
                <Layer size={24} color="#8A8A8E" variant="Linear" />
              </View>
              <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
                No Payments Found
              </Text>
              <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
                There are no payments matching your selected filter.
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
