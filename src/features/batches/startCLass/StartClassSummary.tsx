import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Calendar } from 'iconsax-react-native';
import { COLORS } from '@/styles/styles';
import StartClassStatCard from './StartClassStatCard';

export interface StartClassSummaryProps {
  date?: string;
  batchName?: string;
  subtitle?: string;
  totalStudents?: number;
  allSelected?: boolean;
  onToggleSelectAll?: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StartClassSummary({
  date = 'Today · Oct 24, 2023',
  batchName = 'Morning Batch (6:00 AM - 7:30 AM)',
  subtitle = 'Track daily attendance for Sathya Stadium',
  totalStudents = 90,
  allSelected = false,
  onToggleSelectAll,
  style,
  className = '',
}: StartClassSummaryProps) {
  return (
    <View style={style} className={`px-5 py-2 w-full mb-1 ${className}`}>
      {/* Date Pill Badge */}
      <View className="self-start flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2.5 mb-2.5">
        <Calendar size={20} color={COLORS.secondary} variant="Linear" />
        <Text className="text-[16px] font-urbanist-medium text-secondary tracking-tight">
          {date}
        </Text>
      </View>

      {/* Batch Name & Subtitle */}
      <Text className="text-[24px] font-urbanist-bold text-primary mb-1.5">
        {batchName}
      </Text>
      <Text className="text-[16px] font-urbanist-medium text-secondary mb-5">
        {subtitle}
      </Text>

      {/* Summary Cards Row */}
      <View className="flex-row items-center justify-between gap-5">
        {/* Total Students Card */}
        <StartClassStatCard
          title="TOTAL STUDENTS"
          value={`${totalStudents} Students`}
          backgroundColor="#DCF2FF"
          borderColor="#C6EAFF"
          titleColor="#5A6E85"
          valueColor="#1E1E2D"
        />

        {/* Select All / Mark All Present Card */}
        <StartClassStatCard
          title="SELECT ALL"
          subtitle="Mark all as Present"
          backgroundColor="#EBF8EF"
          borderColor="#D4EBDB"
          titleColor="#5A6E85"
          subtitleColor="#059669"
          showSwitch={true}
          switchValue={allSelected}
          onSwitchChange={onToggleSelectAll}
        />
      </View>
    </View>
  );
}
