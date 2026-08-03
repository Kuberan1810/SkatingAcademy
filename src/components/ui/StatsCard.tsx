import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type StatsCardVariant = 'purple' | 'peach' | 'blue' | 'green' | 'default';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  valueSuffix?: string; // E.g. "/ 126" for attendance totals
  variant?: StatsCardVariant;
  bgColor?: string;
  borderColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const VARIANT_STYLES: Record<
  StatsCardVariant,
  { bg: string; border: string; bgHex: string; borderHex: string }
> = {
  purple: {
    bg: 'bg-[#ECEAF7]',
    border: 'border-[#DFD9FF]',
    bgHex: '#ECEAF7',
    borderHex: '#DFD9FF',
  },
  peach: {
    bg: 'bg-[#FDF2EC]',
    border: 'border-[#FFE0CF]',
    bgHex: '#FDF2EC',
    borderHex: '#FFE0CF',
  },
  blue: {
    bg: 'bg-[#DCF2FF]',
    border: 'border-[#C6EAFF]',
    bgHex: '#DCF2FF',
    borderHex: '#C6EAFF',
  },
  green: {
    bg: 'bg-[#EBF8EF]',
    border: 'border-[#D4EBDB]',
    bgHex: '#EBF8EF',
    borderHex: '#D4EBDB',
  },
  default: {
    bg: 'bg-white',
    border: 'border-primary-border',
    bgHex: '#FFFFFF',
    borderHex: '#F2EEF4',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  valueSuffix,
  variant = 'default',
  bgColor,
  borderColor,
  onPress,
  style,
  className = '',
}: StatsCardProps) {
  const theme = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const isClickable = !!onPress;

  const ContainerView = isClickable ? TouchableOpacity : View;

  return (
    <ContainerView
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        bgColor || borderColor
          ? {
              backgroundColor: bgColor || theme.bgHex,
              borderColor: borderColor || theme.borderHex,
            }
          : undefined,
        style,
      ]}
      className={`rounded-[26px] border p-5 flex-col justify-between ${theme.bg} ${theme.border} ${className}`}
    >
      {/* Title */}
      <Text className="text-[17px] font-urbanist-semibold text-[#424242] mb-2 tracking-tight">
        {title}
      </Text>

      {/* Main Value & Optional Suffix */}
      <View className="flex-row items-baseline mb-1.5 flex-wrap">
        <Text className="text-[28px] font-urbanist-bold text-primary tracking-tight">
          {value}
        </Text>
        {!!valueSuffix && (
          <Text className="text-[16px] font-urbanist-medium text-[#ABABAB] ml-1.5">
            {valueSuffix}
          </Text>
        )}
      </View>

      {/* Subtitle / Trend Note */}
      {!!subtitle && (
        <Text className="text-[14px] font-urbanist-medium text-light tracking-tight">
          {subtitle}
        </Text>
      )}
    </ContainerView>
  );
}
