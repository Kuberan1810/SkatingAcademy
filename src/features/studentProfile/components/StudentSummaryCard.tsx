import styles, { COLORS } from '@/styles/styles';
import { Calendar, Location, Stickynote } from 'iconsax-react-native';
import React from 'react';
import { ImageSourcePropType, StyleProp, Text, View, ViewStyle } from 'react-native';
import StudentAvatar from '@/components/ui/StudentAvatar';

export interface StudentSummaryCardProps {
  name: string;
  joinedDate: string;
  location?: string;
  attendancePercent?: string;
  avatar?: ImageSourcePropType | string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StudentSummaryCard({
  name,
  joinedDate,
  location,
  attendancePercent,
  avatar,
  style,
  className = '',
}: StudentSummaryCardProps) {
  const displayJoinedDate = joinedDate && joinedDate.trim() ? joinedDate : 'Not Provided';
  const displayLocation = location && location.trim() ? location : 'Not Assigned';
  const displayAttendance = attendancePercent && attendancePercent.trim() ? attendancePercent : '0%';

  return (
    <View
      style={[style]}
      className={`p-6 border border-primary-border rounded-[28px] bg-white relative mb-5 ${className}`}
    >
      {/* Top Header Row: Joined Date Pill */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2.5">
          <Calendar size={18} color={COLORS.secondary} variant="Linear" />
          <Text className="text-[14px] font-urbanist-medium text-secondary tracking-tight">
            Joined · {displayJoinedDate}
          </Text>
        </View>
      </View>

      {/* Middle Row: Student Avatar & Student Info */}
      <View className="flex-row items-center">
        <StudentAvatar
          name={name}
          avatarUri={avatar}
          size={44}
        />
        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-[16px] font-urbanist-semibold text-primary tracking-tight"
          >
            {name}
          </Text>
          <View className="flex-row items-center flex-nowrap gap-x-2 mt-1">
            <View className="flex-row items-center gap-1">
              <View style={styles.IconStyle}>
                <Location size={11} color="#626262" variant="Linear" />
              </View>
              <Text className="text-[12px] font-urbanist-medium text-secondary">
                {location}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View style={styles.IconStyle}>
                <Stickynote size={11} color="#626262" variant="Linear" />
              </View>
              <Text className="text-[12px] font-urbanist-medium text-secondary">
                {attendancePercent} Attendance
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
