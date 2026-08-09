import React from 'react';
import { View, Text } from 'react-native';

export type StatType = 'present' | 'absent' | 'attendance' | 'total';

export interface AttendanceStatCardProps {
  type: StatType;
  value: string | number;
  title?: string;
}

const STAT_CONFIG = {
  present: {
    title: 'PRESENT',
    bg: '#EBF8EF',
    border: '#B4E9C5',
    titleColor: '#05773F',
    valueColor: '#05773F',
  },
  absent: {
    title: 'ABSENT',
    bg: '#F8EBEB',
    border: '#E6B5B5',
    titleColor: '#E70C0C',
    valueColor: '#E70C0C',
  },
  attendance: {
    title: 'ATTENDANCE',
    bg: '#DCF2FF',
    border: '#ACE0FF',
    titleColor: '#0EA3FB',
    valueColor: '#0EA3FB',
  },
  total: {
    title: 'TOTAL',
    bg: '#DCF2FF',
    border: '#ACE0FF',
    titleColor: '#0EA3FB',
    valueColor: '#0EA3FB',
  },
};

export default function AttendanceStatCard({ type, value, title }: AttendanceStatCardProps) {
  const config = STAT_CONFIG[type] || STAT_CONFIG.attendance;
  const displayTitle = title || config.title;

  return (
    <View
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
      className="flex-1 border rounded-[30px] py-4 px-2 min-h-[96px] items-center justify-center"
    >
      <Text
        style={{ color: config.titleColor }}
        className="text-[12px] font-urbanist-bold tracking-wider uppercase text-center mb-1.5"
      >
        {displayTitle}
      </Text>
      <Text
        style={{ color: config.valueColor }}
        className="text-[24px] font-urbanist-semibold text-center tracking-tight"
      >
        {value}
      </Text>
    </View>
  );
}
