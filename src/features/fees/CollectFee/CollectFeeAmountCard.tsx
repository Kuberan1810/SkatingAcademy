import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { ArrowDown2 } from 'iconsax-react-native';
import styles, { COLORS } from '@/styles/styles';
import OptionPickerModal from '@/features/creation/studentCreation/components/OptionPickerModal';

const MONTH_OPTIONS = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(String);

export interface CollectFeeAmountCardProps {
  amount?: string;
  feeMonth: number;
  onFeeMonthChange: (month: number) => void;
  feeYear: number;
  onFeeYearChange: (year: number) => void;
  discount: string;
  onDiscountChange: (text: string) => void;
  lateFine: string;
  onLateFineChange: (text: string) => void;
  netPayable?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function CollectFeeAmountCard({
  amount = '₹0',
  feeMonth,
  onFeeMonthChange,
  feeYear,
  onFeeYearChange,
  discount,
  onDiscountChange,
  lateFine,
  onLateFineChange,
  netPayable = '₹0',
  style,
  className = '',
}: CollectFeeAmountCardProps) {
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);

  const selectedMonthObj = MONTH_OPTIONS.find((m) => m.value === feeMonth) || MONTH_OPTIONS[0];

  const handleToggleCustomPeriod = () => {
    if (isCustomPeriod) {
      const now = new Date();
      onFeeMonthChange(now.getMonth() + 1);
      onFeeYearChange(now.getFullYear());
    }
    setIsCustomPeriod((prev) => !prev);
  };

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
      <View className='flex-1 flex-row justify-between  items-center mb-5'>
        {/* Title */}
        <Text className="text-[22px] font-urbanist-semibold text-primary tracking-tight ">
          Amount to Collect
        </Text>
        {/* Toggle / Change Period Button */}
        <TouchableOpacity
          onPress={handleToggleCustomPeriod}
          className="flex-row items-center px-3 py-2 rounded-full bg-[#FAF8FD] border  border-primary-border gap-1.5 active:bg-gray-100"
        >
          <Text className="text-[12px] font-urbanist-semibold text-secondary">
            {isCustomPeriod ? 'Current Month' : 'Past / Custom Month'}
          </Text>
          <ArrowDown2
            size={12}
            color="#626262"
            style={{ transform: [{ rotate: isCustomPeriod ? '180deg' : '0deg' }] }}
          />
        </TouchableOpacity>
    </View>

      {/* Amount + Fee Period Header */}
      <View className="mb-5">
        <View className="flex-row items-center justify-between flex-wrap gap-2 mb-2">
          <View className="flex-row items-baseline gap-2 flex-wrap flex-1">
            <Text className="text-[28px] font-urbanist-bold text-primary tracking-tight">
              {amount}
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-[#7A7A7A]">
              {selectedMonthObj.label} {feeYear} Monthly Fee
            </Text>
          </View>

          
        </View>

        {/* Month & Year Selectors (Shown only when Past / Custom Month is toggled) */}
        {isCustomPeriod && (
          <View className="flex-row items-center justify-between mt-2 p-3 bg-[#FAF8FD] border border-primary-border rounded-2xl">
            <Text className="text-[13px] font-urbanist-medium text-[#626262]">
              Select Period:
            </Text>
            <View className="flex-row items-center gap-2">
              {/* Month Selector Pill */}
              <TouchableOpacity
                onPress={() => setIsMonthModalOpen(true)}
                className="flex-row items-center px-3.5 py-1.5 rounded-full bg-white border  border-primary-border gap-1.5 active:bg-gray-100"
              >
                <Text className="text-[13px] font-urbanist-semibold text-primary">
                  {selectedMonthObj.label}
                </Text>
                <ArrowDown2 size={14} color="#626262" />
              </TouchableOpacity>

              {/* Year Selector Pill */}
              <TouchableOpacity
                onPress={() => setIsYearModalOpen(true)}
                className="flex-row items-center px-3 py-1.5 rounded-full bg-white border  border-primary-border gap-1.5 active:bg-gray-100"
              >
                <Text className="text-[13px] font-urbanist-semibold text-primary">
                  {feeYear}
                </Text>
                <ArrowDown2 size={14} color="#626262" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Inputs: Discount & Late Fine */}
      <View className="flex-row items-center gap-3 mb-5">
        {/* Discount Input */}
        <View className="flex-1">
          <Text className="text-[15px] font-urbanist-medium text-secondary mb-1.5">
            Discount
          </Text>
          <View className="flex-row items-center px-6 h-[50px] bg-[#FAF8FD] border  border-primary-border rounded-full">
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
          <View className="flex-row items-center px-6 h-[50px] bg-[#FAF8FD] border  border-primary-border rounded-full">
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
        className="flex-row items-center justify-between px-4 py-3 rounded-[28px] border"
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

      {/* Month Selection Modal */}
      <OptionPickerModal
        visible={isMonthModalOpen}
        title={`Select Fee Month (${feeYear})`}
        options={MONTH_OPTIONS.map((m) => m.label)}
        selectedValue={selectedMonthObj.label}
        onSelect={(label) => {
          const match = MONTH_OPTIONS.find((m) => m.label === label);
          if (match) onFeeMonthChange(match.value);
        }}
        onClose={() => setIsMonthModalOpen(false)}
      />

      {/* Year Selection Modal */}
      <OptionPickerModal
        visible={isYearModalOpen}
        title="Select Fee Year"
        options={YEAR_OPTIONS}
        selectedValue={String(feeYear)}
        onSelect={(val) => onFeeYearChange(parseInt(val, 10))}
        onClose={() => setIsYearModalOpen(false)}
      />
    </View>
  );
}
