import styles from '@/styles/styles';
import React from 'react';
import { Text, View } from 'react-native';
import { BalanceSummary } from '../../types';

export interface BalanceSummaryCardProps {
  summary: BalanceSummary;
}

export default function BalanceSummaryCard({ summary }: BalanceSummaryCardProps) {
  return (
    <View
      style={[styles.InnerShadowStyle]}
      className="bg-[#4086F7] rounded-[15px] p-5 mb-5"
    >
      {/* Top Section: Last Paid */}
      <View className="flex-row items-end justify-between mb-3">
        <View>
          <Text className="text-[14px] font-urbanist-medium text-white/80 uppercase tracking-wider mb-1">
            LAST PAID
          </Text>
          <Text className="text-[24px] font-urbanist-semibold text-white">
            {summary.lastPaidAmount}
          </Text>
        </View>

        <Text className="text-[12px] font-urbanist-medium text-white/80 pt-1">
          {summary.lastPaidDate}
        </Text>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-white/20 my-2" />

      {/* Bottom Section: Next Payment */}
      <View>
        <Text className="text-[14px] font-urbanist-medium text-white/80 uppercase tracking-wider mb-1">
          NEXT PAYMENT
        </Text>
        <Text className="text-[24px] font-urbanist-semibold text-white mb-2">
          {summary.nextPaymentAmount}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] font-urbanist-medium text-white/90">
            {summary.nextPaymentDueDate}
          </Text>
          {summary.daysLeftText && (
            <Text className="text-[13px] font-urbanist-medium text-white/90">
              {summary.daysLeftText}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
