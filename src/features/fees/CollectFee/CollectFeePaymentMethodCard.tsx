import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import styles from '@/styles/styles';

export type PaymentMethodType = 'CASH' | 'UPI';

export interface CollectFeePaymentMethodCardProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  notes: string;
  onNotesChange: (text: string) => void;
  onNotesFocus?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function CollectFeePaymentMethodCard({
  selectedMethod = 'CASH',
  onSelectMethod,
  notes,
  onNotesChange,
  onNotesFocus,
  style,
  className = '',
}: CollectFeePaymentMethodCardProps) {
  return (
    <View
      style={[styles.BoxStyle2, style]}
      className={`${className}`}
    >
      {/* Title */}
      <Text className="text-[20px] font-urbanist-semibold text-primary tracking-tight mb-4">
        Payment Method
      </Text>

      {/* Toggle Buttons (CASH / UPI) */}
      <View className="flex-row items-center gap-3 mb-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMethod('CASH')}
          style={selectedMethod === 'CASH' ? styles.InnerShadowStyle : undefined}
          className={`flex-1 py-[18px] rounded-[10px] items-center justify-center border text-base ${
            selectedMethod === 'CASH'
              ? 'bg-[#000000] border-[#000000]'
              : 'bg-[#F4F4F6] border-primary-border'
          }`}
        >
          <Text
            className={`text-[15px] font-urbanist-bold tracking-wide ${
              selectedMethod === 'CASH' ? 'text-white' : 'text-[#626262]'
            }`}
          >
            CASH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMethod('UPI')}
          style={selectedMethod === 'UPI' ? styles.InnerShadowStyle : undefined}
          className={`flex-1 py-[18px] rounded-[10px] items-center justify-center border text-base  ${
            selectedMethod === 'UPI'
              ? 'bg-[#000000] border-[#000000]'
              : 'bg-[#F4F4F6] border-primary-border'
          }`}
        >
          <Text
            className={`text-[15px] font-urbanist-bold tracking-wide ${
              selectedMethod === 'UPI' ? 'text-white' : 'text-[#626262]'
            }`}
          >
            UPI
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes Input Field */}
      <View className="px-5 py-4 bg-[#FAFAFA] border border-primary-border rounded-full">
        <TextInput
          value={notes}
          onChangeText={onNotesChange}
          onFocus={onNotesFocus}
          placeholder="Notes (Optional)"
          placeholderTextColor="#A2A2A7"
          className="text-[16px] font-urbanist-medium text-primary p-0"
        />
      </View>
    </View>
  );
}
