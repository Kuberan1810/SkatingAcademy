import styles from '@/styles/styles';
import React from 'react';
import { Text, View } from 'react-native';
import { CurrentMonthFee } from '../../types';

export interface CurrentMonthFeeCardProps {
  data: CurrentMonthFee;
}

export default function CurrentMonthFeeCard({ data }: CurrentMonthFeeCardProps) {
  const getBackgroundColor = () => {
    switch (data.status) {
      case 'paid':
        return '#059669'; // Green
      case 'pending':
        return '#EA580C'; // Orange
      case 'overdue':
        return '#DC2626'; // Red
      default:
        return '#059669';
    }
  };

  return (
    <View
      style={[
        styles.InnerShadowStyle,
        { backgroundColor: getBackgroundColor() },
      ]}
      className="rounded-[15px] px-5 py-6 mb-5]"
    >
      {/* Top Row: Month/Year & Status Tag */}
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-[14px] font-urbanist-medium text-white/80 uppercase tracking-wider">
          {data.monthYear}
        </Text>
        <Text className="text-[14px] font-urbanist-medium text-white/80">
          {data.statusSubtext}
        </Text>
      </View>

      {/* Bottom Row: Amount & Details */}
      <View className="flex-row items-end justify-between">
        <Text className="text-[24px] font-urbanist-semibold text-white">
          {data.amount}
        </Text>
        <Text className="text-[14px] font-urbanist-medium text-white/80">
          {data.paymentDetails}
        </Text>
      </View>
    </View>
  );
}
