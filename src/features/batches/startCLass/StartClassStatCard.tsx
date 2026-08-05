import FigmaSwitch from '@/components/ui/FigmaSwitch';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

export interface StartClassStatCardProps {
  title: string;
  value?: string;
  subtitle?: string;
  backgroundColor?: string;
  borderColor?: string;
  titleColor?: string;
  valueColor?: string;
  subtitleColor?: string;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function StartClassStatCard({
  title,
  value,
  subtitle,
  backgroundColor = '#DCF2FF',
  borderColor = '#C6EAFF',
  titleColor = '#626262',
  valueColor = '#333333',
  subtitleColor = '#05773F',
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  style,
  className = '',
}: StartClassStatCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
      className={`flex-1 border rounded-[28px] p-6 justify-between  min-h-[104px]  ${className}`}
    >
      {/* Top Header Row (Title & Switch Perfectly Aligned) */}
      <View className="flex-row items-center justify-between ">
        <Text
          style={{ color: titleColor }}
          className="text-[13px] text-secondary font-urbanist-semibold tracking-wider uppercase "
        >
          {title}
        </Text>

        {showSwitch && (
          <FigmaSwitch
            value={switchValue}
            onValueChange={(val) => onSwitchChange?.(val)}
            activeColor="#05773F"
            inactiveColor="#E1E2ED"
            borderColor="#F2EEF4"
          />
        )}
      </View>

      {/* Value Text */}
      {!!value && (
        <Text
          style={{ color: valueColor }}
          className="text-[20px] font-urbanist-bold tracking-tight mt-1"
        >
          {value}
        </Text>
      )}

      {/* Subtitle Text */}
      {!!subtitle && (
        <Text
          style={{ color: subtitleColor }}
          className="text-[16px] font-urbanist-semibold"
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
