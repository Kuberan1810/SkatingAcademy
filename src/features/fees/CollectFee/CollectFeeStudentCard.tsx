import React, { useMemo } from 'react';
import { View, Text, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { CalendarRemove } from 'iconsax-react-native';
import styles from '@/styles/styles';

const DEFAULT_AVATAR = require('@/../assets/images/home/userAvatar.svg');

export interface CollectFeeStudentInfo {
  id?: string;
  name: string;
  studentId: string;
  location: string;
  dueAmount: string;
  dueLabel?: string;
  avatar?: ImageSourcePropType | string;
}

export interface CollectFeeStudentCardProps {
  student?: CollectFeeStudentInfo;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const DEFAULT_STUDENT: CollectFeeStudentInfo = {
  id: '1',
  name: 'Sharma',
  studentId: 'ID: SA-2024-0892',
  location: 'Sathya Stadium',
  dueAmount: '₹1,200',
  dueLabel: 'Due Today',
};

export default function CollectFeeStudentCard({
  student = DEFAULT_STUDENT,
  style,
  className = '',
}: CollectFeeStudentCardProps) {
  const resolvedAvatar = useMemo(() => {
    if (!student.avatar) return DEFAULT_AVATAR;
    if (typeof student.avatar === 'string') {
      return { uri: student.avatar };
    }
    return student.avatar;
  }, [student.avatar]);

  return (
    <View
      style={[styles.BoxStyle2, style]}
      className={`${className}`}
    >
      {/* Top Row: Avatar + Student Info + Location Pill */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          <Image
            source={resolvedAvatar}
            style={{ width: 40, height: 40, borderRadius: 22 }}
            contentFit="cover"
            transition={200}
          />
          <View className="ml-3 flex-1">
            <Text
              numberOfLines={1}
              className="text-[18px] font-urbanist-bold text-primary tracking-tight"
            >
              {student.name}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[14px] font-urbanist-medium text-secondary mt-0.5"
            >
              {student.studentId}
            </Text>
          </View>
        </View>

        {/* Location Pill */}
        <View className="px-3.5 py-1.5 rounded-full bg-[#F0F0F0] border border-primary-border">
          <Text className="text-[14px] font-urbanist-medium text-secondary">
            {student.location}
          </Text>
        </View>
      </View>

      {/* Bottom Row: Red Due Today Pill */}
      <View className="mt-4 flex-row items-center self-start">
        <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-[#F9F9F9] border border-primary-border gap-2">
          <View
            style={{
              backgroundColor: '#F8E2E2',
              borderColor: '#F8B4B4',
              borderRadius: 9999,
              ...styles.RedShadowStyle,
            }}
            className="p-1.5 rounded-full items-center justify-center border"
          >
            <CalendarRemove size={16} color="#E70C0C" variant="Linear" />
          </View>
          <Text
            style={{ color: '#E70C0C' }}
            className="text-[13px] font-urbanist-semibold tracking-tight"
          >
            {student.dueLabel || 'Due Today'}: {student.dueAmount}
          </Text>
        </View>
      </View>
    </View>
  );
}
