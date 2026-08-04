import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Calendar, Clock, Profile2User } from 'iconsax-react-native';
import styles, { COLORS } from '@/styles/styles';
import { EllipsisVertical } from 'lucide-react-native';
import PrimaryBtn from '@/components/ui/PrimaryBtn';

export type BatchStatusVariant = 'upcoming' | 'started' | 'completed';

export interface BatchCardProps {
  id?: string;
  /** Batch Name (e.g. "Morning Batch 2") */
  title: string;
  /** Time slot (e.g. "9:00 - 10:00 am") */
  time: string;
  /** Number of students or formatted text (e.g. 24 or "24 Students") */
  studentsCount: number | string;
  /** Date string for upcoming batch (e.g. "10 Jul 2026") */
  date?: string;
  /** Attendance info if session completed (e.g. "20/24" or { present: 20, total: 24 }) */
  attendance?: string | { present: number; total: number };
  /** Batch session status */
  status?: BatchStatusVariant;
  /** Custom label for action button */
  actionLabel?: string;
  /** Callback when action button (Start / View Attendance) is pressed */
  onActionPress?: () => void;
  /** Callback when 3-dots context menu button is pressed */
  onMorePress?: () => void;
  /** Callback when card is pressed */
  onPressCard?: () => void;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom Tailwind class for container */
  className?: string;
}

export default function BatchCard({
  title,
  time,
  studentsCount,
  date = '10 Jul 2026',
  attendance,
  status,
  actionLabel,
  onActionPress,
  onMorePress,
  onPressCard,
  style,
  className = '',
}: BatchCardProps) {
  const isCompleted = status === 'completed' || !!attendance;
  const formattedStudents =
    typeof studentsCount === 'number'
      ? `${studentsCount} Students`
      : studentsCount;

  let presentCount = 20;
  let totalCount = 24;
  if (typeof attendance === 'object') {
    presentCount = attendance.present;
    totalCount = attendance.total;
  } else if (typeof attendance === 'string') {
    const parts = attendance.split('/');
    if (parts.length === 2) {
      presentCount = parseInt(parts[0], 10) || 20;
      totalCount = parseInt(parts[1], 10) || 24;
    }
  }

  const buttonText =
    actionLabel || (isCompleted ? 'View Attendance' : 'Start');

  const Container = onPressCard ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.85}
      onPress={onPressCard}
      className={`p-6 border border-primary-border rounded-[30px] bg-white relative ${className}`}
      style={[style]}
    >
      {/* Top Row: Date/Attendance Badge + 3-Dots Menu Button */}
      <View className="flex-row items-center justify-between">
        {/* Left Badge */}
        {isCompleted ? (
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
              <Profile2User size={16} color={COLORS.greenPrimary} variant="Linear" />
            </View>
            <View className="flex-row items-baseline">
              <Text
                style={{ color: COLORS.greenPrimary }}
                className="text-[14px] font-urbanist-semibold tracking-tight"
              >
                Today Present:{' '}
              </Text>
              <Text
                style={{ color: COLORS.greenPrimary }}
                className="text-[15px] font-urbanist-semibold"
              >
                {presentCount}
              </Text>
              <Text
                style={{ color: COLORS.greenPrimary, fontSize: 11 }}
                className="font-urbanist-medium"
              >
                /{totalCount}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2.5">
            <Calendar size={18} color={COLORS.secondary} variant="Linear" />
            <Text className="text-[15px] font-urbanist-medium text-secondary tracking-tight">
              {date}
            </Text>
          </View>
        )}

        {/* Right: 3-Dots More Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onMorePress}
          className="p-[6px] rounded-[8px] bg-[#F4F4F6] border border-primary-border items-center justify-center"
        >
          <EllipsisVertical size={18} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Middle: Batch Title */}
      <Text
        numberOfLines={1}
        className="text-[20px] font-urbanist-semibold text-primary tracking-tight mt-4 mb-4"
      >
        {title}
      </Text>

      {/* Meta Info Row: Time & Students Count */}
      <View className="flex-row items-center justify-between mb-5">
        {/* Time */}
        <View className="flex-row items-center gap-2">
          <View style={styles.IconStyle}>
            <Clock size={12} color="#626262" variant="Linear" />
          </View>
          <Text className="text-[15px] font-urbanist-medium text-secondary">
            {time}
          </Text>
        </View>

        {/* Students Count */}
        <View className="flex-row items-center gap-2">
          <View style={styles.IconStyle}>
            <Profile2User size={12} color="#626262" variant="Linear" />
          </View>
          <Text className="text-[15px] font-urbanist-medium text-secondary">
            {formattedStudents}
          </Text>
        </View>
      </View>

      {/* Bottom Row: Reusable Primary Action Button */}
      <PrimaryBtn
        label={buttonText}
        onPress={onActionPress}
        variant={isCompleted ? 'green' : 'black'}
      />
    </Container>
  );
}
