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
  CalendarRemove,
} from 'iconsax-react-native';
import styles, { COLORS } from '@/styles/styles';

const DEFAULT_AVATAR = require('@/../assets/images/home/userAvatar.svg');

export type FeeStatusVariant = 'overdue' | 'due_today' | 'upcoming' | string;

export interface PendingFeeCardProps {
  /** Student full name */
  studentName: string;
  /** Optional Batch Name or Location */
  batchName?: string;
  /** Formatted due date */
  dueDate?: string;
  /** Amount due */
  amount: string | number;
  /** Phone number to dial */
  phone?: string;
  /** Alias for phone number */
  phoneNumber?: string;
  /** Status variant ('overdue' | 'due_today') */
  status?: FeeStatusVariant;
  /** Status badge custom text label */
  statusLabel?: string;
  /** Student avatar image source */
  avatarSource?: any;
  /** Callback when call icon button is pressed */
  onCallPress?: () => void;
  /** Callback when Collect Fee button is pressed */
  onCollectPress?: () => void;
  /** Card container press handler */
  onPressCard?: () => void;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom Tailwind class for container */
  className?: string;
}

export function FeeStatusBadge() {
  return null;
}

export default function PendingFeeCard({
  studentName,
  batchName = 'Sathya Stadium',
  dueDate,
  amount,
  phone,
  phoneNumber,
  status = 'due_today',
  statusLabel,
  avatarSource,
  onCallPress,
  onCollectPress,
  onPressCard,
  style,
  className = '',
}: PendingFeeCardProps) {
  const resolvedAvatar = useMemo(() => {
    if (!avatarSource) return DEFAULT_AVATAR;
    if (typeof avatarSource === 'string') {
      return { uri: avatarSource };
    }
    return avatarSource;
  }, [avatarSource]);

  const formattedAmount =
    typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : amount;

  const handleCall = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      const num = phone || phoneNumber;
      if (num) {
        Linking.openURL(`tel:${num}`);
      }
    }
  };

  const isDueToday = status?.toLowerCase().includes('today') || status === 'due_today';
  const isOverdue = status?.toLowerCase().includes('overdue') || !isDueToday;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPressCard}
      style={[style, styles.BoxStyle2]}
      className={`relative bg-white ${className}`}
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
              {studentName}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[12px] font-urbanist-medium text-secondary mt-0.5"
            >
              {batchName}
            </Text>
          </View>
        </View>

        {/* Action Buttons: Phone Call & Collect Fee */}
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

          {/* Collect Fee Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onCollectPress}
            style={styles.InnerShadowStyle}
            className="rounded-[14px] h-[40px] bg-[#0E0E0E] px-[16px] items-center justify-center"
          >
            <Text className="text-[13px] font-urbanist-semibold text-white tracking-tight">
              Collect Fee
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Row: Status Pills (Due Today & Overdue) */}
      <View className="flex-row items-center flex-wrap gap-2">
        {/* Due Today Badge */}
        {isDueToday && (
          <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-[#F9F9F9] border border-primary-border gap-1.5">
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
              Due Today: {formattedAmount}
            </Text>
          </View>
        )}

        {/* Overdue Badge */}
        {isOverdue && !isDueToday && (
          <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-[#F9F9F9] border border-primary-border gap-1.5">
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
              Overdue: {formattedAmount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
