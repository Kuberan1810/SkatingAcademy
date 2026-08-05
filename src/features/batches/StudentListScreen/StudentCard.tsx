import styles, { COLORS } from '@/styles/styles';
import { Image } from 'expo-image';
import {
  Calendar,
  Call,
  Stickynote,
  Location,
  User,
  CallCalling,
  Profile2User,
} from 'iconsax-react-native';
import { EllipsisVertical } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  ImageSourcePropType,
  Linking,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const DEFAULT_AVATAR = require('@/../assets/images/user-avatar.png');

export interface StudentListItem {
  id: string;
  name: string;
  joinedDate: string;
  location?: string;
  attendancePercent?: string;
  phone?: string;
  avatar?: ImageSourcePropType | string;
  paymentStatus: 'paid' | 'overdue';
  amount?: string;
  paidDate?: string;
  attendanceRatio: string;
  attendanceRatioStatus?: 'success' | 'danger';
}

export interface StudentCardProps {
  student: StudentListItem;
  onPress?: (student: StudentListItem) => void;
  onMorePress?: (student: StudentListItem) => void;
  onCallPress?: (phone?: string) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StudentCard({
  student,
  onPress,
  onMorePress,
  onCallPress,
  style,
  className = '',
}: StudentCardProps) {
  const resolvedAvatar = useMemo(() => {
    if (!student.avatar) return DEFAULT_AVATAR;
    if (typeof student.avatar === 'string') {
      return { uri: student.avatar };
    }
    return student.avatar;
  }, [student.avatar]);

  const handleCall = () => {
    if (onCallPress) {
      onCallPress(student.phone);
    } else if (student.phone) {
      Linking.openURL(`tel:${student.phone}`);
    }
  };

  const isPaid = student.paymentStatus === 'paid';
  const isRatioSuccess =
    student.attendanceRatioStatus === 'success' ||
    (!student.attendanceRatioStatus && isPaid);

  // Extract ratio numbers e.g. "20/24" -> present: 20, total: 24
  const ratioParts = (student.attendanceRatio || '20/24').split('/');
  const presentCount = ratioParts[0] || '20';
  const totalCount = ratioParts[1] || '24';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(student)}
      style={[style]}
      className={`p-6 border border-primary-border rounded-[28px] bg-white relative ${className}`}
    >
      {/* Top Header Row: Joined Date Pill & 3-Dots Action Menu */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Date Pill */}
        <View className="flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2.5">
          <Calendar size={20} color={COLORS.secondary} variant="Linear" />
          <Text className="text-[16px] font-urbanist-medium text-secondary tracking-tight">
            Joined · {student.joinedDate}
          </Text>
        </View>

        {/* 3-Dots More Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onMorePress?.(student)}
          className="p-[6px] rounded-[8px] bg-[#F4F4F6] border border-primary-border items-center justify-center"
        >
          <EllipsisVertical size={18} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Middle Row: Avatar, Student Info & Phone Call Button */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1 mr-3">
          <Image
            source={resolvedAvatar}
            style={{ width: 48, height: 48, borderRadius: 26 }}
            contentFit="cover"
            transition={200}
          />
          <View className="ml-3 flex-1">
            <Text
              numberOfLines={1}
              className="text-[20px] font-urbanist-semibold text-primary tracking-tight"
            >
              {student.name}
            </Text>
            <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1 mt-1">
              <View className="flex-row items-center gap-1.5">
                <View style={styles.IconStyle}>
                  <Location size={12} color="#626262" variant="Linear" />
                </View>
                <Text className="text-[14px] font-urbanist-medium text-secondary">
                  {student.location || 'Sathya Stadium'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View style={styles.IconStyle}>
                  <Stickynote size={12} color="#626262" variant="Linear" />
                </View>
                <Text className="text-[14px] font-urbanist-medium text-secondary">
                  {student.attendancePercent || '92%'} Attendance
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Circular Phone Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCall}
          style={styles.InnerShadowStyle}
          className="rounded-[18px] bg-[#4086F7] p-4 items-center justify-center"
        >
          <CallCalling size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Status Badges / Pills matching BatchCard style */}
      <View className="flex-row items-center flex-wrap gap-2.5">
        {/* Paid / Overdue Status Pill */}
        {isPaid ? (
          <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-2">
            <View
              style={{
                backgroundColor: COLORS.greenLight,
                borderColor: COLORS.greenBorder,
                borderRadius: 9999,
                ...styles.GreenShadowStyle,
              }}
              className="w-[32px] h-[32px] rounded-full items-center justify-center border"
            >
              <User size={16} color={COLORS.greenPrimary} variant="Linear" />
            </View>
            <Text
              style={{ color: COLORS.greenPrimary }}
              className="text-[14px] font-urbanist-semibold tracking-tight"
            >
              Paid: {student.amount || '₹1,200'}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-2">
            <View
              style={{
                backgroundColor: 'rgba(231, 12, 12, 0.10)',
                borderColor: '#F8B4B4',
                borderRadius: 9999,
              }}
              className="w-[32px] h-[32px] rounded-full items-center justify-center border"
            >
              <Calendar size={16} color="#E70C0C" variant="Linear" />
            </View>
            <Text
              style={{ color: '#E70C0C' }}
              className="text-[14px] font-urbanist-semibold tracking-tight"
            >
              Overdue: {student.amount || '₹1,200'}
            </Text>
          </View>
        )}

        {/* Paid On Date Pill (Only for Paid Status if present) */}
        {isPaid && student.paidDate && (
          <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-2">
            <View
              style={{
                backgroundColor: COLORS.greenLight,
                borderColor: COLORS.greenBorder,
                borderRadius: 9999,
                ...styles.GreenShadowStyle,
              }}
              className="w-[32px] h-[32px] rounded-full items-center justify-center border"
            >
              <Calendar size={16} color={COLORS.greenPrimary} variant="Linear" />
            </View>
            <Text
              style={{ color: COLORS.greenPrimary }}
              className="text-[14px] font-urbanist-semibold tracking-tight"
            >
              Paid On: {student.paidDate}
            </Text>
          </View>
        )}

        {/* Attendance Ratio Pill (Green or Red) */}
        <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-2">
          <View
            style={{
              backgroundColor: isRatioSuccess
                ? COLORS.greenLight
                : 'rgba(231, 12, 12, 0.10)',
              borderColor: isRatioSuccess ? COLORS.greenBorder : '#F8B4B4',
              borderRadius: 9999,
              ...(isRatioSuccess ? styles.GreenShadowStyle : {}),
            }}
            className="w-[32px] h-[32px] rounded-full items-center justify-center border"
          >
            <Calendar
              size={16}
              color={isRatioSuccess ? COLORS.greenPrimary : '#E70C0C'}
              variant="Linear"
            />
          </View>
          <View className="flex-row items-baseline">
            <Text
              style={{
                color: isRatioSuccess ? COLORS.greenPrimary : '#E70C0C',
              }}
              className="text-[15px] font-urbanist-bold tracking-tight"
            >
              {presentCount}
            </Text>
            <Text
              style={{
                color: isRatioSuccess ? COLORS.greenPrimary : '#E70C0C',
                fontSize: 11,
              }}
              className="font-urbanist-medium"
            >
              /{totalCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
