import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Clock, Profile2User } from 'iconsax-react-native';
import styles from '@/styles/styles';

export type SessionStatusVariant = 'completed' | 'start' | 'upcoming' | string;

export interface UpcomingSessionsCardProps {
  /** Session location / title (e.g. "Don Bosco", "Sathya Stadium") */
  title: string;
  /** Session timing (e.g. "9:00 - 10:00 am") */
  time: string;
  /** Number of students or formatted label (e.g. "24 Students" or 24) */
  studentsCount: number | string;
  /** Status variant ('completed' | 'start' | 'upcoming' | custom label) */
  status?: SessionStatusVariant;
  /** Custom status button label if different from status variant */
  statusLabel?: string;
  /** Custom action press handler on status pill button */
  onStatusPress?: () => void;
  /** Card container press handler */
  onPressCard?: () => void;
  /** Custom style for the card container */
  style?: StyleProp<ViewStyle>;
  /** Custom Tailwind class for container */
  className?: string;
}

/**
 * Reusable Status Pill Button with Figma inner-shadow effect and custom green/black fills.
 */
export function StatusPillButton({
  status = 'start',
  label,
  onPress,
}: {
  status?: SessionStatusVariant;
  label?: string;
  onPress?: () => void;
}) {
  const normalizedStatus = status.toLowerCase();

  const isCompleted = normalizedStatus === 'completed';
  const isStart = normalizedStatus === 'start';

  // Format display label
  const displayLabel =
    label ||
    (isCompleted ? 'Completed' : isStart ? 'Start' : status);

  // Colors matching Figma specs (#02763D for completed, #0E0E0E for start)
  const bgColor = isCompleted
    ? '#02763D'
    : isStart
    ? '#0E0E0E'
    : '#0E0E0E';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[{ backgroundColor: bgColor }, styles.InnerShadowStyle]}
      className="px-[18px] py-[10px] rounded-[14px] flex-row items-center justify-center self-center"
    >
      <Text className="text-[13px] font-urbanist-semibold text-white tracking-tight">
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
}

export default function UpcomingSessionsCard({
  title,
  time,
  studentsCount,
  status = 'start',
  statusLabel,
  onStatusPress,
  onPressCard,
  style,
  className = '',
}: UpcomingSessionsCardProps) {
  const formattedStudents =
    typeof studentsCount === 'number'
      ? `${studentsCount} Students`
      : studentsCount.includes('Student')
      ? studentsCount
      : `${studentsCount} Students`;

  const Container = onPressCard ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.85}
      onPress={onPressCard}
      style={[styles.BoxStyle, style]}
      className={`flex-row items-center justify-between ${className}`}
    >
      {/* Left Details */}
      <View className="flex-1 mr-3 justify-center">
        {/* Title */}
        <Text className="text-[20px] font-urbanist-semibold text-primary tracking-tight mb-2">
          {title}
        </Text>

        {/* Metadata Row: Time & Student Count */}
        <View className="flex-row items-center justify-between flex-wrap">
          {/* Time */}
          <View className="flex-row items-center gap-1.5">
            <View style={styles.IconStyle}>
              <Clock size={14} color="#626262" variant="Linear" />
            </View>
            <Text className="text-[14px] font-urbanist-medium text-secondary">
              {time}
            </Text>
          </View>

          {/* Students Count */}
          <View className="flex-row items-center gap-1.5">
            <View style={styles.IconStyle}>
              <Profile2User size={14} color="#626262" variant="Linear" />
            </View>
            <Text className="text-[14px] font-urbanist-medium text-secondary">
              {formattedStudents}
            </Text>
          </View>
        </View>
      </View>

      {/* Right Action Button */}
      <StatusPillButton
        status={status}
        label={statusLabel}
        onPress={onStatusPress}
      />
    </Container>
  );
}
