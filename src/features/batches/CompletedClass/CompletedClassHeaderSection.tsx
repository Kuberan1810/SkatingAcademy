import React from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'iconsax-react-native';
import { COLORS } from '@/styles/styles';

export interface CompletedClassHeaderSectionProps {
  dateText?: string;
  batchName?: string;
  subtitle?: string;
}

export default function CompletedClassHeaderSection({
  dateText = 'Today · Oct 24, 2023',
  batchName = 'Morning Batch (6:00 AM - 7:30 AM)',
  subtitle = 'Track daily attendance for Sathya Stadium',
}: CompletedClassHeaderSectionProps) {
  return (
    <View className="mb-2">
      {/* Date Pill Badge */}
      <View className="self-start flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2.5 mb-2.5">
        <Calendar size={20} color={COLORS.secondary} variant="Linear" />
        <Text className="text-[16px] font-urbanist-medium text-secondary tracking-tight">
          {dateText}
        </Text>
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
