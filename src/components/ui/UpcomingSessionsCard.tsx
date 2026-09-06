import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
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
  /** Loading state for status action button */
  loading?: boolean;
}

/**
 * Reusable Status Pill Button with Figma inner-shadow effect and custom green/black fills.
 */
export function StatusPillButton({
  status = 'start',
  label,
  onPress,
  loading = false,
}: {
  status?: SessionStatusVariant;
  label?: string;
  onPress?: () => void;
  loading?: boolean;
}) {
  const normalizedStatus = (status || 'start').toLowerCase();

  const isCompleted = normalizedStatus === 'completed';
  const isNoClass = normalizedStatus === 'no_class' || normalizedStatus === 'noclass';

  // Format display label
  const displayLabel =
    label ||
    (isCompleted ? 'Completed' : isNoClass ? 'No Class' : 'Start');

  // Colors matching specs (#02763D for completed, #F4F4F6 for no_class, #0E0E0E for start)
  const bgColor = isCompleted
    ? '#02763D'
    : isNoClass
    ? '#F4F4F6'
    : '#0E0E0E';

  const textColor = isNoClass ? '#8A8A8E' : '#FFFFFF';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={loading || isNoClass}
      onPress={isNoClass ? undefined : onPress}
      style={[
        {
          backgroundColor: bgColor,
          opacity: loading || isNoClass ? 0.7 : 1,
        },
        styles.InnerShadowStyle,
      ]}
      className="px-[18px] py-[10px] rounded-[14px] flex-row items-center justify-center self-center"
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text
          style={{ color: textColor }}
          className="text-[13px] font-urbanist-semibold tracking-tight"
        >
          {displayLabel}
        </Text>
      )}
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
  loading = false,
}: UpcomingSessionsCardProps) {
  const formattedStudents =
    typeof studentsCount === 'number'
      ? `${studentsCount} Students`
      : typeof studentsCount === 'string'
      ? studentsCount.includes('Student')
        ? studentsCount
        : `${studentsCount} Students`
      : `${studentsCount ?? 0} Students`;

  const LeftContainer = onPressCard ? TouchableOpacity : View;

  return (
    <View
      style={[styles.BoxStyle, style]}
      className={`flex-row items-center justify-between ${className}`}
    >
      {/* Left Details (Clickable if onPressCard provided) */}
      <LeftContainer
        activeOpacity={0.8}
        onPress={onPressCard}
        className="flex-1 mr-3 justify-center"
      >
        {/* Title */}
        <Text className="text-[20px] font-urbanist-semibold text-primary tracking-tight mb-2">
          {title}
        </Text>

        {/* Metadata Row: Time & Student Count */}
        <View className="flex-row items-center gap-2.5 flex-wrap">
          {/* Time */}
          <View className="flex-row items-center gap-2">
            <View style={styles.IconStyle}>
              <Clock size={14} color="#626262" variant="Linear" />
            </View>
            <Text className="text-[14px] font-urbanist-medium text-secondary">
              {time}
            </Text>
          </View>

          {/* Students Count */}
          <View className="flex-row items-center gap-2">
            <View style={styles.IconStyle}>
              <Profile2User size={14} color="#626262" variant="Linear" />
            </View>
            <Text className="text-[14px] font-urbanist-medium text-secondary">
              {formattedStudents}
            </Text>
          </View>
        </View>
      </LeftContainer>

      {/* Right Action Button (Independent Touchable) */}
      <StatusPillButton
        status={status}
        label={statusLabel}
        loading={loading}
        onPress={onStatusPress}
      />
    </View>
  );
}
