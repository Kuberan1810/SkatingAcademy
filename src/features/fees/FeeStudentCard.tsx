import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import {
  CallCalling,
  ProfileTick,
  Calendar,
  CalendarRemove,
  CalendarTick,
} from 'iconsax-react-native';
import styles, { COLORS } from '@/styles/styles';

const DEFAULT_AVATAR = require('@/../assets/images/home/userAvatar.svg');

export interface FeeStudentListItem {
  id: string;
  name: string;
  location?: string;
  avatar?: ImageSourcePropType | string;
  phone?: string;
  paymentStatus: 'paid' | 'due_today' | 'overdue' | 'unpaid';
  amount?: string;
  paidDate?: string;
  dueDate?: string;
}

export interface FeeStudentCardProps {
  student: FeeStudentListItem;
  onPress?: (student: FeeStudentListItem) => void;
  onCallPress?: (phone?: string) => void;
  onCollectPress?: (student: FeeStudentListItem) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function FeeStudentCard({
  student,
  onPress,
  onCallPress,
  onCollectPress,
  style,
  className = '',
}: FeeStudentCardProps) {
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
  const isDueToday = student.paymentStatus === 'due_today';
  const isOverdue = student.paymentStatus === 'overdue' || student.paymentStatus === 'unpaid';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(student)}
      style={[style, styles.BoxStyle2]}
      className={` relative ${className}`}
    >
      {/* Top Row: Avatar, Student Info & Action Buttons */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          <Image
            source={resolvedAvatar}
            style={{ width: 40, height: 40, borderRadius: 22 }}
            contentFit="cover"
            transition={200}
          />
          <View className="ml-2.5 flex-1 justify-center">
            <Text
              numberOfLines={1}
              className="text-[16px] font-urbanist-semibold text-primary tracking-tight"
            >
              {student.name}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[12px] font-urbanist-medium text-secondary mt-0.5"
            >
              {student.location || 'Sathya Stadium'}
            </Text>
          </View>
        </View>

        {/* Action Buttons: Phone Call & Paid/Collect Fee */}
        <View className="flex-row items-center gap-2">
          {/* Circular Phone Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCall}
            style={styles.InnerShadowStyle}
            className="p-2.5 w-[40px] h-[40px] rounded-[15px] bg-[#4086F7] items-center justify-center"
          >
            <CallCalling size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Paid Badge or Collect Fee Button */}
          {isPaid ? (
            <View
              style={[styles.InnerShadowStyle]}
              className="p-2.5 w-[50px] h-[40px] rounded-[14px] bg-success items-center justify-center">
              <Text className="text-[16px] font-urbanist-medium text-white tracking-tight">
                Paid
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onCollectPress?.(student)}
              style={styles.InnerShadowStyle}
              className="rounded-[14px]  h-[40px] bg-[#0E0E0E] px-[16px]  items-center justify-center"
            >
              <Text className="text-[13px] font-urbanist-semibold text-white tracking-tight">
                Collect Fee
              </Text>
              </TouchableOpacity>
          
          )}
        </View>
      </View>

      {/* Bottom Row: Status Pills matching Figma design */}
      <View className="flex-row items-center flex-wrap gap-2">
        {/* Paid Status Badges */}
        {isPaid && (
          <>
            <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-1.5">
              <View
                style={{
                  backgroundColor: COLORS.greenLight,
                  borderColor: COLORS.greenBorder,
                  borderRadius: 9999,
                  ...styles.GreenShadowStyle,
                }}
                className="p-1.5 rounded-full items-center justify-center border"
              >
                <ProfileTick size={14} color={COLORS.greenPrimary} variant="Linear" />
              </View>
              <Text
                style={{ color: COLORS.greenPrimary }}
                className="text-[12px] font-urbanist-semibold tracking-tight"
              >
                Paid: {student.amount || '₹1,200'}
              </Text>
            </View>

            {student.paidDate && (
              <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-1.5">
                <View
                  style={{
                    backgroundColor: COLORS.greenLight,
                    borderColor: COLORS.greenBorder,
                    borderRadius: 9999,
                    ...styles.GreenShadowStyle,
                  }}
                  className="p-1.5 rounded-full items-center justify-center border"
                >
                  <CalendarTick size={14} color={COLORS.greenPrimary} variant="Linear" />
                </View>
                <Text
                  style={{ color: COLORS.greenPrimary }}
                  className="text-[12px] font-urbanist-semibold tracking-tight"
                >
                  Paid On: {student.paidDate}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Due Today Badge */}
        {isDueToday && (
          <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-1.5">
            <View
              style={{
                backgroundColor: '#F8E2E2',
                borderColor: '#F8B4B4',
                borderRadius: 9999,
                ...styles.RedShadowStyle,
              }}
              className="p-1.5 rounded-full items-center justify-center border"
            >
              <CalendarRemove size={14} color="#E70C0C" variant="Linear" />
            </View>
            <Text
              style={{ color: '#E70C0C' }}
              className="text-[12px] font-urbanist-semibold tracking-tight"
            >
              Due Today: {student.amount || '₹1,200'}
            </Text>
          </View>
        )}

        {/* Overdue Badge */}
        {isOverdue && !isDueToday && (
          <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-1.5">
            <View
              style={{
                backgroundColor: '#F8E2E2',
                borderColor: '#F8B4B4',
                borderRadius: 9999,
                ...styles.RedShadowStyle,
              }}
              className="p-1.5 rounded-full items-center justify-center border"
            >
              <CalendarRemove size={14} color="#E70C0C" variant="Linear" />
            </View>
            <Text
              style={{ color: '#E70C0C' }}
              className="text-[12px] font-urbanist-semibold tracking-tight"
            >
              Overdue: {student.amount || '₹1,200'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
