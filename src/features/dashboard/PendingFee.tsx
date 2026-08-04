import React, { useState } from 'react';
import { View, Text, StyleProp, ViewStyle, Linking } from 'react-native';
import { Card } from 'iconsax-react-native';
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

        <BtnCom label="View all" onClick={onViewAllPress} />
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
              onPressCard={() => onFeeItemPress?.(item)}
              onCallPress={() => handleCallItem(item)}
              onCollectPress={() => onCollectPress?.(item)}
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