import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Calendar, Call, CallCalling } from 'iconsax-react-native';
import styles from '@/styles/styles';

export type FeeStatusVariant = 'overdue' | 'due_today' | 'upcoming' | string;

export interface PendingFeeCardProps {
  /** Student full name (e.g. "Marcus Thorne") */
  studentName: string;
  /** Optional Batch Name (e.g. "Morning Batch A" or "Don Bosco") */
  batchName?: string;
  /** Formatted due date (e.g. "Oct 15, 2023" or "Due: Oct 15, 2023") */
  dueDate: string;
  /** Amount due (e.g. "₹1,200" or 1200) */
  amount: string | number;
  /** Phone number to dial */
  phone?: string;
  /** Alias for phone number */
  phoneNumber?: string;
  /** Status variant ('overdue' | 'due_today' | custom label) */
  status?: FeeStatusVariant;
  /** Status badge custom text label if different from status variant */
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

/**
 * Status Badge displayed flush at top-right corner of Pending Fee Card
 */
export function FeeStatusBadge({
  status = 'overdue',
  label,
}: {
  status?: FeeStatusVariant;
  label?: string;
}) {
  const normalizedStatus = status.toLowerCase();
  const isOverdue = normalizedStatus.includes('overdue');
  const isDueToday = normalizedStatus.includes('today');

  const displayLabel =
    label ||
    (isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : status);

  const bgColor = isOverdue
    ? '#FDE4E4'
    : isDueToday
      ? '#FEF3C7'
      : '#F3F4F6';

  const textColor = isOverdue
    ? '#E70C0C'
    : isDueToday
      ? '#D97706'
      : '#4B5563';

  return (
    <View
      style={{ backgroundColor: bgColor }}
      className="absolute top-0 right-0 px-5 py-2.5 rounded-tr-[28px] rounded-bl-[20px]"
    >
      <Text
        style={{ color: textColor }}
        className="text-[15px] font-urbanist-medium tracking-tight"
      >
        {displayLabel}
      </Text>
    </View>
  );
}

export default function PendingFeeCard({
  studentName,
  batchName,
  dueDate,
  amount,
  phone,
  phoneNumber,
  status = 'overdue',
  statusLabel,
  avatarSource,
  onCallPress,
  onCollectPress,
  onPressCard,
  style,
  className = '',
}: PendingFeeCardProps) {
  const formattedDueDate = dueDate.startsWith('Due:')
    ? dueDate
    : `Due: ${dueDate}`;

  const formattedAmount =
    typeof amount === 'number' ? `₹${amount.toLocaleString()}` : amount;

  const Container = onPressCard ? TouchableOpacity : View;

  // Fallback initials if avatar is not provided
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

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

  return (
    <Container
      activeOpacity={0.85}
      onPress={onPressCard}

      className={`px-3 py-4 border border-primary-border rounded-[28px] relative overflow-hidden bg-white ${className}`}
    >
      {/* Flush Top-Right Status Badge */}
      <FeeStatusBadge status={status} label={statusLabel} />

      {/* Top Row: Avatar + Student Info */}
      <View className="flex-row items-center pr-24 pt-1">
        {/* Avatar Container */}
        {avatarSource ? (
          <Image
            source={avatarSource}

            className="w-[56px] h-[56px] rounded-full bg-[#3B82F6] mr-4"
            contentFit="cover"
          />
        ) : (
          <View
            // style={styles.InnerShadowStyle}
            className="w-[56px] h-[56px] rounded-full bg-[#3B82F6] items-center justify-center mr-4">
            <Text className="text-[20px] font-urbanist-bold text-white">
              {initials}
            </Text>
          </View>
        )}

        {/* Student Name & Due Date + Batch */}
        <View className="flex-1 justify-center">
          <Text
            numberOfLines={1}
            className="text-[20px] font-urbanist-semibold text-primary tracking-tight mb-2"
          >
            {studentName}
          </Text>

          <View className="flex-row items-center flex-nowrap gap-1.5">
            <Calendar size={18} color="#626262" variant="Linear" />
            <Text className="text-[15px] font-urbanist-medium text-secondary">
              {formattedDueDate}
            </Text>

            {batchName && (
              <>
                <Text className="text-[14px] font-urbanist-bold text-[#A0A0A0]">
                  •
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-[15px] font-urbanist-medium text-secondary"
                >
                  {batchName}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-[#F2EEF4] my-5" />

      {/* Bottom Row: Amount Due & Action Buttons */}
      <View className="flex-row items-center justify-between">
        {/* Left: Amount Due */}
        <View>
          <Text className="text-[14px] font-urbanist-medium text-secondary mb-1">
            Amount Due
          </Text>
          <Text
            className={`text-[25px] font-urbanist-semibold tracking-tight ${status?.toLowerCase().includes('overdue')
                ? 'text-[#E70C0C]'
                : 'text-primary'
              }`}
          >
            {formattedAmount}
          </Text>
        </View>

        {/* Right: Action Buttons (Call & Collect Fee) */}
        <View className="flex-row items-center gap-3">
          {/* Call Icon Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCall}
            style={styles.InnerShadowStyle}
            className="rounded-[18px] bg-[#4086F7] p-4 items-center justify-center"
          >
            <CallCalling size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Collect Fee Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onCollectPress}
            style={styles.InnerShadowStyle}
            className="rounded-[18px] bg-[#0E0E0E] px-[22px] py-[14px] items-center justify-center"
          >
            <Text className="text-[15px] font-urbanist-semibold text-white tracking-tight">
              Collect Fee
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}
