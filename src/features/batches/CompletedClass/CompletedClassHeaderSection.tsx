import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, CalendarAdd } from 'iconsax-react-native';
import { COLORS } from '@/styles/styles';

export interface CompletedClassHeaderSectionProps {
  dateText?: string;
  batchName?: string;
  subtitle?: string;
  isCompensationClass?: boolean;
  compensationReason?: string | null;
}

export default function CompletedClassHeaderSection({
  dateText = 'Today · Oct 24, 2023',
  batchName = 'Morning Batch (6:00 AM - 7:30 AM)',
  subtitle = 'Track daily attendance for Sathya Stadium',
  isCompensationClass = false,
  compensationReason,
}: CompletedClassHeaderSectionProps) {
  return (
    <View className="mb-2">
      {/* Top Date & Compensation Badge Row */}
      <View className="flex-row items-center gap-2 mb-3 flex-wrap">
        {/* Date Pill */}
        <View className="self-start flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2">
          <Calendar size={18} color={COLORS.secondary} variant="Linear" />
          <Text className="text-[15px] font-urbanist-medium text-secondary tracking-tight">
            {dateText}
          </Text>
        </View>

        {/* Simple & Clean Extra Class / Reason Pill */}
        {isCompensationClass && (
          <View className="flex-row items-center px-3 py-2 rounded-[12px] bg-[#FFFBEB] border border-[#FDE68A] gap-1.5">
            <CalendarAdd size={16} color="#D97706" />
            <Text className="text-[13px] font-urbanist-semibold text-[#B45309]">
              {compensationReason ? `Extra Class · ${compensationReason}` : 'Extra Class'}
            </Text>
          </View>
        )}
      </View>

      {/* Batch Name & Subtitle */}
      <Text className="text-[24px] font-urbanist-bold text-primary mb-1.5">
        {batchName}
      </Text>
      <Text className="text-[16px] font-urbanist-medium text-secondary mb-5">
        {subtitle}
      </Text>
    </View>
  );
}
