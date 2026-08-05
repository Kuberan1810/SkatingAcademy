import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { ProfileTick } from 'iconsax-react-native';
import styles, { COLORS } from '@/styles/styles';

const DEFAULT_AVATAR = require('@/../assets/images/home/userAvatar.svg');

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
  const resolvedAvatar = useMemo(() => {
    if (!item.avatar) return DEFAULT_AVATAR;
    if (typeof item.avatar === 'string') {
      return { uri: item.avatar };
    }
    return item.avatar;
  }, [item.avatar]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(item)}
      style={[style]}
      className={`p-2.5 border border-primary-border rounded-[28px] bg-white flex-row items-center justify-between ${className}`}
    >
      {/* Left: Avatar & Payment Details */}
      <View className="flex-row items-center flex-1 ">
        <View className=" rounded-full overflow-hidden ">
          <Image
            source={resolvedAvatar}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View className="ml-2 flex-1 justify-center">
          <Text
            numberOfLines={1}
            className="text-[16px] font-urbanist-semibold text-primary tracking-tight"
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

      {/* Right: Amount (+₹2,400) or Pill Badge */}

     
        <Text className="text-[16px] font-urbanist-medium text-[#02763D] tracking-tight">
          +{item.amount}
        </Text>
  
    </TouchableOpacity>
  );
}
