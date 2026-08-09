import React from 'react';
import { Text, View } from 'react-native';
import { BalanceSummary, CurrentMonthFee, TransactionItem } from '../../types';
import BalanceSummaryCard from '../ui/BalanceSummaryCard';
import CurrentMonthFeeCard from '../ui/CurrentMonthFeeCard';
import TransactionHistoryItem from '../ui/TransactionHistoryItem';

export interface PaymentsTabProps {
  balanceSummary: BalanceSummary;
  currentMonthFee: CurrentMonthFee;
  transactions: TransactionItem[];
}

export default function PaymentsTab({
  balanceSummary,
  currentMonthFee,
  transactions,
}: PaymentsTabProps) {
  return (
    <View className="w-full">
      {/* Balance Summary Header & Card */}
      <Text className="text-[20px] font-urbanist-bold text-primary mb-5">
        Balance Summary
      </Text>
      <BalanceSummaryCard summary={balanceSummary} />

      {/* Current Month Header & Dynamic Status Card */}
      <Text className="text-[20px] font-urbanist-bold text-primary mb-5">
        Current month
      </Text>
      <CurrentMonthFeeCard data={currentMonthFee} />

      {/* Transaction History Header & List */}
      <Text className="text-[20px] font-urbanist-bold text-primary mb-5 mt-5">
        Transaction History
      </Text>
      <View className="w-full">
        {transactions.map((tx) => (
          <TransactionHistoryItem key={tx.id} item={tx} />
        ))}
      </View>
    </View>
  );
}
