import React from 'react';
import { View, Text, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { CalendarTick, CalendarRemove } from 'iconsax-react-native';
import styles, { COLORS } from '@/styles/styles';

const DEFAULT_AVATAR = require('@/../assets/images/home/userAvatar.svg');

export interface CompletedStudentItem {
  id: string;
  name: string;
  attendancePercent: string;
  status: 'present' | 'absent';
  attendanceRatio?: string;
  avatar?: ImageSourcePropType | string;
}

export interface CompletedStudentCardProps {
  student: CompletedStudentItem;
}

export default function CompletedStudentCard({ student }: CompletedStudentCardProps) {
  const isPresent = student.status === 'present';
  const resolvedAvatar =
    typeof student.avatar === 'string'
      ? { uri: student.avatar }
      : student.avatar || DEFAULT_AVATAR;

  const ratioText = student.attendanceRatio || '20/24';
  const [num, denom] = ratioText.includes('/') ? ratioText.split('/') : [ratioText, '24'];

  return (
    <View
      
      className="bg-[#F9F9F9] rounded-[28px] p-3.5 border border-primary-border flex-row items-center justify-between"
    >
      {/* Left: Avatar + Name & Present/Absent Badge */}
      <View className="flex-row items-center flex-1 ">
        {/* Avatar Image */}
        <Image
          source={resolvedAvatar}
          style={{ width: 40, height: 40, borderRadius: 25 }}
          contentFit="cover"
        />

        <View className="ml-3.5 flex-1 justify-center">
          {/* Top Row: Name + Status Badge */}
          <View className="flex-row items-center gap-2.5">
            <Text
              numberOfLines={1}
              className="text-[16px] font-urbanist-semibold text-primary tracking-tight"
            >
              {student.name}
            </Text>

            {/* Status Capsule Badge */}
            <View
              style={{
                backgroundColor: isPresent ? 'rgba(2, 118, 61, 0.12)' : 'rgba(231, 12, 12, 0.12)',
                borderRadius: 9999,
              }}
              className="px-3 py-1.5 items-center justify-center self-center"
            >
              <Text
                style={{
                  color: isPresent ? '#167D44' : '#D72C2C',
                }}
                className="text-[12px] font-urbanist-medium"
              >
                {isPresent ? 'Present' : 'Absent'}
              </Text>
            </View>
          </View>

          {/* Subtitle: Attendance Percent */}
          <Text className="text-[14px] font-urbanist-medium text-secondary mt-0.5">
            {student.attendancePercent}
          </Text>
        </View>
      </View>

      {/* Attendance Ratio Pill (Green or Red) */}
      <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-2">
        <View
          style={{
            backgroundColor: isPresent
              ? COLORS.greenLight
              : 'rgba(231, 12, 12, 0.10)',
            borderColor: isPresent ? COLORS.greenBorder : '#F8B4B4',
            borderRadius: 9999,
            ...(isPresent ? styles.GreenShadowStyle : styles.RedShadowStyle),
          }}
          className="p-1.5 rounded-full items-center justify-center border"
        >
          <CalendarTick
            size={16}
            color={isPresent ? COLORS.greenPrimary : '#E70C0C'}
            variant="Linear"
          />
        </View>
        <View className="flex-row items-baseline">
          <Text
            style={{
              color: isPresent ? COLORS.greenPrimary : '#E70C0C',
            }}
            className="text-[16px] font-urbanist-bold tracking-tight"
          >
            {num}
          </Text>
          <Text
            style={{
              color: isPresent ? COLORS.greenPrimary : '#E70C0C',
              fontSize: 10,
            }}
            className="font-urbanist-medium"
          >
            /{denom || '24'}
          </Text>
        </View>
      </View>
    </View>
  );
}
