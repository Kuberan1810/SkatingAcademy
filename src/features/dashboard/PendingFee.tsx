import React, { useState } from 'react';
import { View, Text, StyleProp, ViewStyle, Linking } from 'react-native';
import { Card } from 'iconsax-react-native';
import { router } from 'expo-router';
import BtnCom from '@/components/ui/BtnCom';
import FiltersTabs from '@/components/ui/FiltersTabs';
import PendingFeeCard, { PendingFeeCardProps } from '@/components/ui/PendingFeeCard';
import styles from '@/styles/styles';

export interface PendingFeeItem extends PendingFeeCardProps {
  id: string;
}

export interface PendingFeeProps {
  title?: string;
  amountText?: string;
  studentsCountText?: string;
  fees?: PendingFeeItem[];
  tabs?: string[];
  emptyText?: string;
  onViewAllPress?: () => void;
  onTabChange?: (tab: string) => void;
  onFeeItemPress?: (item: PendingFeeItem) => void;
  onCallPress?: (item: PendingFeeItem) => void;
  onCollectPress?: (item: PendingFeeItem) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const DEFAULT_FEES: PendingFeeItem[] = [
  {
    id: '1',
    studentName: 'Marcus Thorne',
    batchName: 'Morning Batch A',
    dueDate: 'Oct 15, 2023',
    amount: '₹1,200',
    status: 'Overdue',
    phone: '+919600927801',
  },
  {
    id: '2',
    studentName: 'Kavitha Subramanian',
    batchName: 'Don Bosco Evening',
    dueDate: 'Oct 20, 2023',
    amount: '₹2,500',
    status: 'Due Today',
    phone: '+917550364255',
  },
];

export default function PendingFee({
  title = 'Pending Fee Collection',
  amountText = '₹18,600',
  studentsCountText = '7 students',
  fees = DEFAULT_FEES,
  tabs = ['All', 'Due Today', 'Overdue', 'Tomorrow'],
  emptyText = 'No pending fees',
  onViewAllPress,
  onTabChange,
  onFeeItemPress,
  onCallPress,
  onCollectPress,
  style,
  className = '',
}: PendingFeeProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress();
    } else {
      router.push('/(tabs)/dashboard/pending-fees' as any);
    }
  };

  const filteredFees = fees.filter((fee) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Due Today') return fee.status?.toLowerCase().includes('today');
    if (activeFilter === 'Overdue') return fee.status?.toLowerCase().includes('overdue');
    return fee.status === activeFilter;
  });

  const handleTabSelect = (tab: string) => {
    setActiveFilter(tab);
    onTabChange?.(tab);
  };

  const handleCallItem = (item: PendingFeeItem) => {
    if (onCallPress) {
      onCallPress(item);
    } else {
      const num = item.phone || item.phoneNumber;
      if (num) {
        Linking.openURL(`tel:${num}`);
      }
    }
  };

  const handleCollectItem = (item: PendingFeeItem) => {
    if (onCollectPress) {
      onCollectPress(item);
    } else {
      router.push('/(tabs)/fees/CollectFee' as any);
    }
  };

  const handleFeeItemPress = (item: PendingFeeItem) => {
    if (onFeeItemPress) {
      onFeeItemPress(item);
    } else {
      const statusUpper = (item.status || '').toUpperCase();
      const feeStatus = statusUpper.includes('OVERDUE') ? 'OVERDUE' : 'PENDING';
      const formattedAmount =
        typeof item.amount === 'number' ? `₹${item.amount.toLocaleString('en-IN')}` : item.amount;

      const studentProfileData = {
        id: item.id || '1',
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
          id: item.id,
          studentData: JSON.stringify(studentProfileData),
        },
      } as any);
    }
  };

  const subtitleText = `${amountText} across ${studentsCountText}`;

  return (
    <View style={style} className={`mt-[30px] ${className}`}>
      {/* Header Row: Title & Subtitle + View All Button */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 mr-3">
          <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight">
            {title}
          </Text>
          <Text className="text-[16px] font-urbanist-medium text-secondary mt-1">
            {subtitleText}
          </Text>
        </View>

        <BtnCom label="View all" onClick={handleViewAll} />
      </View>

      {/* Filter Tabs */}
      <FiltersTabs
        tabs={tabs}
        activeTab={activeFilter}
        onSelectTab={handleTabSelect}
        scrollable={true}
        containerClassName="mb-5"
      />

      {/* Pending Fee Cards / Empty State */}
      <View className="gap-5">
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
              onPressCard={() => handleFeeItemPress(item)}
              onCallPress={() => handleCallItem(item)}
              onCollectPress={() => handleCollectItem(item)}
            />
          ))
        ) : (
          <View style={styles.BoxStyle} className="py-8 items-center justify-center">
            <View style={styles.IconStyle} className="mb-2 p-2.5">
              <Card size={24} color="#8A8A8E" variant="Linear" />
            </View>
            <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
              {emptyText}
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
              There are no pending fees in this category.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}