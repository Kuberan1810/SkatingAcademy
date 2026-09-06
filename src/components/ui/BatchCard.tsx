import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Calendar, CalendarRemove, Clock, Profile2User } from 'iconsax-react-native';
import styles, { COLORS } from '@/styles/styles';
import { EllipsisVertical } from 'lucide-react-native';
import PrimaryBtn from '@/components/ui/PrimaryBtn';

export type BatchStatusVariant = 'upcoming' | 'started' | 'completed' | 'no_class';

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
  /** Attendance stats object { present, total } or string "20/24" for completed batch */
  attendance?: { present: number; total: number } | string;
  /** Status variant or API status string ('completed' | 'no_class' | 'started' | 'upcoming') */
  status?: BatchStatusVariant | string;
  /** Custom action button label (overrides default based on status) */
  actionLabel?: string;
  /** Loading state for primary action button */
  loading?: boolean;
  /** Action handler when clicking the primary button */
  onActionPress?: () => void;
  /** 3-dots more menu button press handler */
  onMorePress?: () => void;
  /** Card body press handler (navigates to details or completed class) */
  onPressCard?: () => void;
  /** Custom outer style */
  style?: StyleProp<ViewStyle>;
  /** Custom Tailwind classes */
  className?: string;
}

function BatchCard({
  title,
  time,
  studentsCount,
  date,
  attendance,
  status,
  actionLabel,
  loading = false,
  onActionPress,
  onMorePress,
  onPressCard,
  style,
  className = '',
}: BatchCardProps) {
  const normalizedStatus = (status || '').toLowerCase();
  const isCompleted = normalizedStatus === 'completed';
  const isNoClass =
    normalizedStatus === 'no_class' ||
    normalizedStatus === 'noclass' ||
    normalizedStatus === 'no class' ||
    (actionLabel || '').toLowerCase() === 'no class';

  const formattedStudents =
    typeof studentsCount === 'number'
      ? `${studentsCount} Students`
      : studentsCount;

  let presentCount = 0;
  let totalCount = 0;
  if (typeof attendance === 'object') {
    presentCount = attendance.present;
    totalCount = attendance.total;
  } else if (typeof attendance === 'string') {
    const parts = attendance.split('/');
    if (parts.length === 2) {
      presentCount = parseInt(parts[0], 10) || 0;
      totalCount = parseInt(parts[1], 10) || 0;
    }
  }

  const buttonText =
    actionLabel ||
    (isCompleted ? 'View Attendance' : isNoClass ? 'No Class' : 'Start Class');

  const BodyContainer = onPressCard ? TouchableOpacity : View;

  return (
    <View
      className={`p-6 border border-primary-border rounded-[30px] bg-white relative ${className}`}
      style={[style]}
    >
      {/* Top Row: Date/Attendance Badge + 3-Dots Menu Button */}
      <View className="flex-row items-center justify-between">
        {/* Left Badge (Clickable as part of card body) */}
        <BodyContainer
          activeOpacity={0.85}
          onPress={onPressCard}
          className="flex-1 mr-2"
        >
          {isCompleted ? (
            <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-2 self-start">
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
          ) : isNoClass ? (
            <View className="flex-row items-center p-2.5 rounded-[12px] bg-[#FFF1F2] border border-[#FECDD3] gap-2.5 self-start">
              <CalendarRemove size={18} color="#E11D48" variant="Linear" />
              <Text className="text-[15px] font-urbanist-medium text-[#E11D48] tracking-tight">
                No Class · {date}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2.5 self-start">
              <Calendar size={18} color={COLORS.secondary} variant="Linear" />
              <Text className="text-[15px] font-urbanist-medium text-secondary tracking-tight">
                {date}
              </Text>
            </View>
          )}
        </BodyContainer>

        {/* Right: 3-Dots More Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onMorePress}
          className="p-[6px] rounded-[8px] bg-[#F4F4F6] border border-primary-border items-center justify-center"
        >
          <EllipsisVertical size={18} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Middle Body Area: Title & Meta Info */}
      <BodyContainer
        activeOpacity={0.85}
        onPress={onPressCard}
      >
        {/* Batch Title */}
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
      </BodyContainer>

      {/* Bottom Row: Reusable Primary Action Button */}
      <PrimaryBtn
        label={buttonText}
        onPress={isNoClass ? undefined : onActionPress}
        variant={isCompleted ? 'green' : 'black'}
        disabled={isNoClass || loading}
        bgColor={isNoClass ? '#EBE7E7' : undefined}
        textColor={isNoClass ? '#8A8A8E' : '#FFFFFF'}
        loading={loading}
      />
    </View>
  );
}

export default React.memo(BatchCard);
