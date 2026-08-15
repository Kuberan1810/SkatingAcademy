import React from 'react';
import { Text, View } from 'react-native';
import { Receipt2 } from 'iconsax-react-native';
import styles from '@/styles/styles';
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
  transactions = [],
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
        {transactions && transactions.length > 0 ? (
          transactions.map((tx) => (
            <TransactionHistoryItem key={tx.id} item={tx} />
          ))
        ) : (
          <View style={styles.BoxStyle} className="py-8 items-center justify-center">
            <View style={styles.IconStyle} className="mb-2 p-2.5">
              <Receipt2 size={24} color="#8A8A8E" variant="Linear" />
            </View>
            <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
              No Transactions Found
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
              There are no transaction records for this student yet.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
