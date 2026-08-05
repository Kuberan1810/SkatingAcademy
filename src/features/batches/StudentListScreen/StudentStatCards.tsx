import styles, { COLORS } from '@/styles/styles';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

export interface StudentStatCardsProps {
  totalStudents?: string | number;
  avgAttendance?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StudentStatCards({
  totalStudents = '90 Students',
  avgAttendance = '92%',
  style,
  className = '',
}: StudentStatCardsProps) {
  const displayTotal =
    typeof totalStudents === 'number'
      ? `${totalStudents} Students`
      : totalStudents;

  return (
    <View
      style={style}
      className={`flex-row items-center gap-5 w-full ${className}`}
    >
      {/* Total Students Card (Soft Blue) */}
      <View
        style={{ backgroundColor: '#DCF2FF', borderColor: '#C6EAFF' }}
        className="flex-1 border rounded-[28px] p-5 justify-center min-h-[96px] "
      >
        <Text className="text-[13px] font-urbanist-semibold text-[#626262] tracking-wider uppercase text-center mb-2">
          TOTAL STUDENTS
        </Text>
        <Text className="text-[20px] font-urbanist-bold text-primary tracking-tight text-center ">
          {displayTotal}
        </Text>
      </View>

      {/* Avg Attendance Card (Soft Green) */}
      <View
        style={{ backgroundColor: '#EBF8EF', borderColor: '#D4EBDB' }}
        className="flex-1 border rounded-[28px] p-6 justify-between  min-h-[96px] "
      >
        <Text
          style={{ color: COLORS.greenPrimary }}
          className="text-[13px] font-urbanist-semibold  tracking-wider uppercase text-center" >
          AVG ATTENDANCE
        </Text>
        <Text
          style={{ color: COLORS.greenPrimary }}
          className="text-[20px] font-urbanist-bold  tracking-tight text-center">
          {avgAttendance}
        </Text>
      </View>
    </View>
  );
}
