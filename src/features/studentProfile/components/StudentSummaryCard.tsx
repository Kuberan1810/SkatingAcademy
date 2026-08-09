import styles, { COLORS } from '@/styles/styles';
import { Image } from 'expo-image';
import { Calendar, Location, Stickynote } from 'iconsax-react-native';
import React, { useMemo } from 'react';
import { ImageSourcePropType, StyleProp, Text, View, ViewStyle } from 'react-native';

const DEFAULT_AVATAR = require('@/../assets/images/home/userAvatar.svg');

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
  location = 'Sathya Stadium',
  attendancePercent = '92%',
  avatar,
  style,
  className = '',
}: StudentSummaryCardProps) {
  const resolvedAvatar = useMemo(() => {
    if (!avatar) return DEFAULT_AVATAR;
    if (typeof avatar === 'string') {
      return { uri: avatar };
    }
    return avatar;
  }, [avatar]);

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
            Joined · {joinedDate}
          </Text>
        </View>
      </View>

      {/* Middle Row: Avatar & Student Info */}
      <View className="flex-row items-center">
        <Image
          source={resolvedAvatar}
          style={{ width: 40, height: 40, borderRadius: 26 }}
          contentFit="cover"
          transition={200}
        />
        <View className="ml-2.5 flex-1">
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
