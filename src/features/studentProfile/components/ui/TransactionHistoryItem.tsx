import React from 'react';
import { View, Text } from 'react-native';
import { ReceiptText } from 'iconsax-react-native';
import { TransactionItem } from '../../types';
import styles from '@/styles/styles';

export interface TransactionHistoryItemProps {
  item: TransactionItem;
}

export default function TransactionHistoryItem({ item }: TransactionHistoryItemProps) {
  const isPaid = item.status === 'PAID';

  return (
    <View
      className="bg-white rounded-[28px] px-[10px] py-[12px] border border-primary-border flex-row items-center justify-between mb-2.5"
    >
      {/* Left Column: Icon + Text */}
      <View className="flex-row items-center gap-3">
        <View className="p-2.5 rounded-full bg-[#EFF6FF] items-center justify-center">
          <ReceiptText size={22} color="#3B82F6" variant="Linear" />
        </View>

        <View>
          <Text className="text-[15px] font-urbanist-bold text-primary mb-0.5">
            {item.title}
          </Text>
          <Text className="text-[13px] font-urbanist-medium text-secondary">
            {item.dateAndMethod}
          </Text>
        </View>
      </View>

      {/* Right Column: Amount + Status Pill */}
      <View className="items-end gap-1">
        <Text className="text-[16px] font-urbanist-semibold text-success">
          {item.amount}
        </Text>
        <View
          className={`px-2 py-0.5 rounded-full ${
            isPaid ? 'bg-[#02763D]/10' : 'bg-[#FEE2E2]'
          }`}
        >
          <Text
            className={`text-[10px] font-urbanist-bold ${
              isPaid ? 'text-[#02763D]' : 'text-[#DC2626]'
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
}
