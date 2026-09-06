import styles, { COLORS } from '@/styles/styles';
import {
  Calendar,
  Stickynote,
  Location,
  CallCalling,
  ProfileTick,
  CalendarTick,
  CalendarRemove,
  TickCircle,
} from 'iconsax-react-native';
import { EllipsisVertical } from 'lucide-react-native';
import React from 'react';
import {
  ImageSourcePropType,
  Linking,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import StudentAvatar from '@/components/ui/StudentAvatar';

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
  parentName?: string;
  emergencyContact?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  bloodGroup?: string;
  address?: string;
}

export interface StudentCardProps {
  student: StudentListItem;
  onPress?: (student: StudentListItem) => void;
  onMorePress?: (student: StudentListItem) => void;
  onCallPress?: (phone?: string) => void;
  onLongPress?: (student: StudentListItem) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

function StudentCard({
  student,
  onPress,
  onMorePress,
  onCallPress,
  onLongPress,
  isSelectionMode = false,
  isSelected = false,
  style,
  className = '',
}: StudentCardProps) {
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

  // Extract ratio numbers e.g. "20/24" -> present: 20, total: 24 (memoized)
  const [presentCount, totalCount] = React.useMemo(() => {
    const ratioParts = (student.attendanceRatio || '20/24').split('/');
    return [ratioParts[0] || '20', ratioParts[1] || '24'];
  }, [student.attendanceRatio]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(student)}
      onLongPress={() => onLongPress?.(student)}
      delayLongPress={250}
      style={[style]}
      className={`p-4 border rounded-[28px] relative ${
        isSelected ? 'bg-[#EFF6FF] border-[#4186F7]' : 'bg-white border-primary-border'
      } ${className}`}
    >
      {/* Top Header Row: Joined Date Pill & 3-Dots Action Menu / Checkbox */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Date Pill */}
        <View className="flex-row items-center p-2.5 rounded-[12px] bg-[#FAFAFA] border border-primary-border gap-2.5">
          <Calendar size={18} color={COLORS.secondary} variant="Linear" />
          <Text className="text-[14px] font-urbanist-medium text-secondary tracking-tight">
            Joined · {student.joinedDate}
          </Text>
        </View>

        {/* 3-Dots More Button or Selection Checkbox */}
        {isSelectionMode ? (
          <View
            className={`w-[26px] h-[26px] rounded-full items-center justify-center border ${
              isSelected ? 'bg-[#4186F7] border-[#4186F7]' : 'bg-white border-[#CBD5E1]'
            }`}
          >
            {isSelected && <TickCircle size={18} color="#FFFFFF" variant="Bold" />}
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onMorePress?.(student)}
            className="p-[6px] rounded-[8px] bg-[#F4F4F6] border border-primary-border items-center justify-center"
          >
            <EllipsisVertical size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Middle Row: Avatar / Initials Badge, Student Info & Phone Call Button */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center flex-1">
          <StudentAvatar
            name={student.name}
            avatarUri={student.avatar}
            size={40}
          />
          <View className="ml-2.5 flex-1">
            <Text
              numberOfLines={1}
              className="text-[16px] font-urbanist-semibold text-primary tracking-tight"
            >
              {student.name}
            </Text>
            <View className="flex-row items-center flex-nowrap gap-x-2 mt-1">
              <View className="flex-row items-center gap-1">
                <View style={styles.IconStyle}>
                  <Location size={11} color="#626262" variant="Linear" />
                </View>
                <Text className="text-[12px] font-urbanist-medium text-secondary">
                  {student.location || 'Sathya Stadium'}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View style={styles.IconStyle}>
                  <Stickynote size={11} color="#626262" variant="Linear" />
                </View>
                <Text className="text-[12px] font-urbanist-medium text-secondary">
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
          className="rounded-[15px] bg-[#4086F7] p-3.5 items-center justify-center"
        >
          <CallCalling size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Status Badges / Pills matching BatchCard style */}
      <View className="flex-row items-center flex-nowrap gap-2.5">
        {/* Overdue Status Pill (Only rendered when payment is overdue) */}
        {!isPaid && (
          <View className="flex-row items-center pl-[3px] pr-3 py-[3px] rounded-full bg-white border border-primary-border gap-2">
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
              className="text-[12px] font-urbanist-semibold tracking-tight"
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
              className="p-1.5 rounded-full items-center justify-center border"
            >
              <ProfileTick size={16} color={COLORS.greenPrimary} variant="Linear" />
            </View>
            <Text
              style={{ color: COLORS.greenPrimary }}
              className="text-[12px] font-urbanist-semibold tracking-tight"
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
              ...(isRatioSuccess ? styles.GreenShadowStyle : styles.RedShadowStyle),
            }}
            className="p-1.5 rounded-full items-center justify-center border"
          >
            <CalendarTick
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
              className="text-[13px] font-urbanist-bold tracking-tight"
            >
              {presentCount}
            </Text>
            <Text
              style={{
                color: isRatioSuccess ? COLORS.greenPrimary : '#E70C0C',
                fontSize: 10,
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

export default React.memo(StudentCard);
