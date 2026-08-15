import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import StudentAvatar from '@/components/ui/StudentAvatar';

export interface RecentPaymentItem {
  id: string;
  name: string;
  timeAgoOrDate: string;
  paymentMethod: string;
  amount: string;
  avatar?: ImageSourcePropType | string;
  isPillBadge?: boolean;
}

export interface RecentPaymentCardProps {
  item: RecentPaymentItem;
  onPress?: (item: RecentPaymentItem) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function RecentPaymentCard({
  item,
  onPress,
  style,
  className = '',
}: RecentPaymentCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(item)}
      style={[style]}
      className={`p-2.5 border border-primary-border rounded-[28px] bg-white flex-row items-center justify-between ${className}`}
    >
      {/* Left: Avatar & Payment Details */}
      <View className="flex-row items-center flex-1">
        <StudentAvatar
          name={item.name}
          avatarUri={item.avatar}
          size={40}
        />
        <View className="ml-3 flex-1 justify-center">
          <Text
            numberOfLines={1}
            className="text-[16px] font-urbanist-semibold text-primary tracking-tight capitalize"
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            className="text-[13px] font-urbanist-medium text-secondary mt-0.5"
          >
            {item.timeAgoOrDate} · {item.paymentMethod}
          </Text>
        </View>
      </View>

      {/* Right: Amount (+₹2,400) */}
      <Text className="text-[16px] font-urbanist-medium text-[#02763D] tracking-tight">
        +{item.amount}
      </Text>
    </TouchableOpacity>
  );
}
