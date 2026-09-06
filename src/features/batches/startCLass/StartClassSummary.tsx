import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Calendar, CalendarAdd, InfoCircle } from 'iconsax-react-native';
import { COLORS } from '@/styles/styles';
import StartClassStatCard from './StartClassStatCard';

export interface StartClassSummaryProps {
  date?: string;
  batchName?: string;
  subtitle?: string;
  totalStudents?: number;
  allSelected?: boolean;
  isCompensationClass?: boolean;
  compensationReason?: string | null;
  onToggleSelectAll?: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StartClassSummary({
  date ,
  batchName,
  subtitle = 'Track daily attendance for Sathya Stadium',
  totalStudents,
  allSelected = false,
  isCompensationClass = false,
  compensationReason,
  onToggleSelectAll,
  style,
  className = '',
}: StartClassSummaryProps) {
  return (
    <View style={style} className={`px-5 py-2 w-full mb-1 ${className}`}>
      {/* Top Date & Compensation Badge Row */}
      <View className="flex-row items-center gap-2 mb-3 flex-wrap">
        {/* Date Pill */}
        <View className="flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2">
          <Calendar size={18} color={COLORS.secondary} variant="Linear" />
          <Text className="text-[15px] font-urbanist-medium text-secondary tracking-tight">
            {date}
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
