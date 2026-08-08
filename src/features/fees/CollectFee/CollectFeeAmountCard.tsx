import React from 'react';
import { View, Text, TextInput, StyleProp, ViewStyle } from 'react-native';
import styles, { COLORS } from '@/styles/styles';

export interface CollectFeeAmountCardProps {
  amount?: string;
  feePeriodLabel?: string;
  discount: string;
  onDiscountChange: (text: string) => void;
  lateFine: string;
  onLateFineChange: (text: string) => void;
  netPayable: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function CollectFeeAmountCard({
  amount = '₹1,200',
  feePeriodLabel = 'July 2026 Monthly Fee',
  discount,
  onDiscountChange,
  lateFine,
  onLateFineChange,
  netPayable = '₹1,200',
  style,
  className = '',
}: CollectFeeAmountCardProps) {
  const handleDiscountChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      onDiscountChange('');
      return;
    }
    const num = parseInt(digits, 10);
    onDiscountChange(`₹${num.toLocaleString('en-IN')}`);
  };

  const handleLateFineChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      onLateFineChange('');
      return;
    }
    const num = parseInt(digits, 10);
    onLateFineChange(`₹${num.toLocaleString('en-IN')}`);
  };

  return (
    <View
      style={[styles.BoxStyle2, style]}
      className={`${className}`}
    >
      {/* Title */}
      <Text className="text-[22px] font-urbanist-semibold text-primary tracking-tight mb-3">
        Amount to Collect
      </Text>

      {/* Amount + Fee Period Row */}
      <View className="flex-row items-center gap-2 mb-5">
        <Text className="text-[28px] font-urbanist-bold text-primary tracking-tight">
          {amount}
        </Text>
        <Text className="text-[14px] font-urbanist-medium text-secondary">
          {feePeriodLabel}
        </Text>
      </View>

      {/* Inputs: Discount & Late Fine */}
      <View className="flex-row items-center gap-3 mb-5">
        {/* Discount Input */}
        <View className="flex-1">
          <Text className="text-[15px] font-urbanist-medium text-secondary mb-1.5">
            Discount
          </Text>
          <View className="flex-row items-center px-6 h-[50px] bg-[#FAF8FD] border border-[#ECE8F3] rounded-full">
            <TextInput
              value={discount}
              onChangeText={handleDiscountChange}
              placeholder="₹0"
              placeholderTextColor="#A0A0A8"
              keyboardType="numeric"
              className="text-[16px] font-urbanist-medium text-primary flex-1 p-0"
            />
          </View>
        </View>

        {/* Late Fine Input */}
        <View className="flex-1">
          <Text className="text-[15px] font-urbanist-medium text-secondary mb-1.5">
            Late Fine
          </Text>
          <View className="flex-row items-center px-6 h-[50px] bg-[#FAF8FD] border border-[#ECE8F3] rounded-full">
            <TextInput
              value={lateFine}
              onChangeText={handleLateFineChange}
              placeholder="₹0"
              placeholderTextColor="#A0A0A8"
              keyboardType="numeric"
              className="text-[16px] font-urbanist-medium text-primary flex-1 p-0"
            />
          </View>
        </View>
      </View>

      {/* Net Payable Soft Green Banner */}
      <View
        style={{ backgroundColor: '#EBF8EF', borderColor: '#02763D10' }}
        className="flex-row items-center justify-between px-4 py-3 rounded-[28px] border "
      >
        <Text
          style={{ color: COLORS.greenPrimary }}
          className="text-[14px] font-urbanist-medium tracking-tight"
        >
          Net Payable
        </Text>
        <Text
          style={{ color: COLORS.greenPrimary }}
          className="text-[20px] font-urbanist-bold tracking-tight"
        >
          {netPayable}
        </Text>
      </View>
    </View>
  );
}
