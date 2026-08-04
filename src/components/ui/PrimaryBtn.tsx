import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import styles, { COLORS } from '@/styles/styles';

export type PrimaryBtnVariant = 'black' | 'green' | 'default' | 'outline';

export interface PrimaryBtnProps {
  /** Button text label */
  label: string;
  /** Callback when button is pressed */
  onPress?: () => void;
  /** Pre-defined style variant */
  variant?: PrimaryBtnVariant;
  /** Custom background color override */
  bgColor?: string;
  /** Custom text color override */
  textColor?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional icon component */
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
  /** Custom Tailwind className */
  className?: string;
}

export default function PrimaryBtn({
  label,
  onPress,
  variant = 'black',
  bgColor,
  textColor = '#FFFFFF',
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  style,
  textStyle,
  className = '',
}: PrimaryBtnProps) {
  const getBackgroundColor = () => {
    if (bgColor) return bgColor;
    switch (variant) {
      case 'green':
        return COLORS.greenPrimary;
      case 'outline':
        return 'transparent';
      case 'black':
      default:
        return '#0E0E0E';
    }
  };

  const background = getBackgroundColor();
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        !isOutline ? styles.InnerShadowStyle : undefined,
        {
          backgroundColor: background,
          borderColor: isOutline ? COLORS.primary : undefined,
          borderWidth: isOutline ? 1 : 0,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      className={`p-3.5 rounded-[14px] flex-row items-center justify-center px-4 gap-2 ${className}`}
    >
      {Icon && iconPosition === 'left' && (
        <Icon size={20} color={isOutline ? COLORS.primary : textColor} />
      )}
      <Text
        style={[{ color: isOutline ? COLORS.primary : textColor }, textStyle]}
        className="text-[16px] font-urbanist-semibold tracking-tight"
      >
        {label}
      </Text>
      {Icon && iconPosition === 'right' && (
        <Icon size={20} color={isOutline ? COLORS.primary : textColor} />
      )}
    </TouchableOpacity>
  );
}