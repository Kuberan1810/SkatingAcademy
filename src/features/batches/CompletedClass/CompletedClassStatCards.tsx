import React from 'react';
import { View, Text } from 'react-native';

export interface DrawerStatCardProps {
  title: string;
  value: string | number;
  backgroundColor: string;
  borderColor: string;
  titleColor?: string;
  valueColor?: string;
}

export function DrawerStatCard({
  title,
  value,
  backgroundColor,
  borderColor,
  titleColor = '#5A6E85',
  valueColor = '#1E1E2D',
}: DrawerStatCardProps) {
  return (
    <View
      style={{ backgroundColor, borderColor }}
      className="flex-1 border rounded-[28px] p-2.5 min-h-[90px] items-center justify-center"
    >
      <Text
        style={{ color: titleColor }}
        className="text-[12px] font-urbanist-bold tracking-wider uppercase text-center mb-2"
      >
        {title}
      </Text>
      <Text
        style={{ color: valueColor }}
        className="text-[28px] font-urbanist-bold text-center tracking-tight"
      >
        {value}
      </Text>
    </View>
  );
}

export interface CompletedClassStatCardsProps {
  totalCount?: number;
  presentCount?: number;
  absentCount?: number;
}

export default function CompletedClassStatCards({
  totalCount = 90,
  presentCount = 86,
  absentCount = 4,
}: CompletedClassStatCardsProps) {
  const formattedPresent = presentCount < 10 ? `0${presentCount}` : presentCount;
  const formattedAbsent = absentCount < 10 ? `0${absentCount}` : absentCount;

  return (
    <View className="flex-row items-center gap-3 mb-6">
      <DrawerStatCard
        title="TOTAL STUDENTS"
        value={totalCount}
        backgroundColor="#DCF2FF"
        borderColor="#C6EAFF"
        titleColor="#5A6E85"
        valueColor="#1E1E2D"
      />
      <DrawerStatCard
        title="PRESENT"
        value={formattedPresent}
        backgroundColor="#EBF8EF"
        borderColor="#D4EBDB"
        titleColor="#5A6E85"
        valueColor="#167D44"
      />
      <DrawerStatCard
        title="ABSENT"
        value={formattedAbsent}
        backgroundColor="#FDE8E8"
        borderColor="#F9D0D0"
        titleColor="#5A6E85"
        valueColor="#E54848"
      />
    </View>
  );
}
