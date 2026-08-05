import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Check, X } from 'lucide-react-native';
import styles from '@/styles/styles';

const DEFAULT_STUDENT_AVATAR = require('@/../assets/images/user-avatar.png');

export type AttendanceStatus = 'present' | 'absent' | 'none';

export interface StudentData {
  id: string;
  name: string;
  batchName?: string;
  avatar?: ImageSourcePropType | string;
}

export interface StudentAttendanceCardProps {
  student: StudentData;
  status?: AttendanceStatus;
  onStatusChange?: (id: string, status: AttendanceStatus) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StudentAttendanceCard({
  student,
  status = 'none',
  onStatusChange,
  style,
  className = '',
}: StudentAttendanceCardProps) {
  const resolvedAvatar = React.useMemo(() => {
    if (!student.avatar) return DEFAULT_STUDENT_AVATAR;
    if (typeof student.avatar === 'string') {
      return { uri: student.avatar };
    }
    return student.avatar;
  }, [student.avatar]);

  const handlePresentPress = () => {
    const nextStatus = status === 'present' ? 'none' : 'present';
    onStatusChange?.(student.id, nextStatus);
  };

  const handleAbsentPress = () => {
    const nextStatus = status === 'absent' ? 'none' : 'absent';
    onStatusChange?.(student.id, nextStatus);
  };

  const isPresent = status === 'present';
  const isAbsent = status === 'absent';

  return (
    <View
      style={[style]}
      className={`flex-row items-center justify-between w-full bg-[#F9F9F9] p-5 border border-primary-border rounded-[28px] ${className}`}
    >
      {/* Left: Avatar & Info */}
      <View className="flex-row items-center flex-1">
        <View className="w-[50px] h-[50px] rounded-full overflow-hidden justify-center items-center bg-[#DDEEFF]">
          <Image
            source={resolvedAvatar}
            style={{ width: 50, height: 50, borderRadius: 25 }}
            contentFit="cover"
            transition={200}
          />
        </View>

        <View className="ml-3.5 flex-1 justify-center">
          <Text className="text-[17px] font-urbanist-bold text-primary" numberOfLines={1}>
            {student.name}
          </Text>
          <Text className="text-[13px] font-urbanist-medium text-secondary" numberOfLines={1}>
            {student.batchName || 'Morning Batch'}
          </Text>
        </View>
      </View>

      {/* Right: Squircle Present & Absent Action Buttons */}
      <View className="flex-row items-center gap-2.5">
        {/* Present (Checkmark) Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handlePresentPress}
          style={[styles.InnerShadowStyle]}
          className={`w-[40px] h-[40px] rounded-[16px] justify-center items-center transition-all ${
            isPresent ? 'bg-[#167D44]' : 'bg-[#7FB89C]'
          }`}
        >
          <Check size={20} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>

        {/* Absent (Cross) Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleAbsentPress}
          style={[styles.InnerShadowStyle]}
          className={`w-[40px] h-[40px] rounded-[16px] justify-center items-center transition-all ${
            isAbsent ? 'bg-[#E54848]' : 'bg-[#F18383]'
          }`}
        >
          <X size={20} color="#FFFFFF" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
