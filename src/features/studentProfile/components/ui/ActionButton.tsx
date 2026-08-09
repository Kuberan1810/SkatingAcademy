import React from 'react';
import {
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import styles from '@/styles/styles';

export type ActionButtonVariant =
  | 'blue'
  | 'green'
  | 'outline'
  | 'danger'
  | 'dark'
  | 'custom';

export interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode | React.ComponentType<{ size?: number; color?: string; variant?: string }>;
  onPress?: () => void;
  variant?: ActionButtonVariant;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
  iconSize?: number;
  height?: number | string;
  rounded?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
  textClassName?: string;
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
  disabled?: boolean;
}

const VARIANT_CONFIGS = {
  blue: {
    bg: '#4086F7',
    border: 'transparent',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    shadow: styles.InnerShadowStyle,
  },
  green: {
    bg: '#00B35B',
    border: 'transparent',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    shadow: styles.InnerShadowStyle,
  },
  outline: {
    bg: '#FFFFFF',
    border: '#F2EEF4',
    text: '#374151',
    icon: '#374151',
    shadow: styles.BlackInnerShadowStyle,
  },
  danger: {
    bg: '#E70C0C',
    border: 'transparent',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    shadow: styles.InnerShadowStyle,
  },
  dark: {
    bg: '#111827',
    border: 'transparent',
    text: '#FFFFFF',
    icon: '#FFFFFF',
    shadow: styles.InnerShadowStyle,
  },
  custom: {
    bg: '#FFFFFF',
    border: '#F2EEF4',
    text: '#333333',
    icon: '#333333',
    shadow: undefined,
  },
};

function renderIcon(
  icon: ActionButtonProps['icon'],
  color: string,
  size: number
): React.ReactNode {
  if (!icon) return null;
  if (React.isValidElement(icon)) {
    return icon;
  }
  const IconComponent = icon as React.ComponentType<any>;
  return <IconComponent size={size} color={color} variant="Linear" />;
}

export default function ActionButton({
  label,
  icon,
  onPress,
  variant = 'blue',
  bgColor,
  textColor,
  borderColor,
  iconColor,
  iconSize = 18,
  rounded = 'rounded-[15px]',
  style,
  className = '',
  textClassName = '',
  hapticStyle = 'medium',
  disabled = false,
}: ActionButtonProps) {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.blue;
  const resolvedBg = bgColor || config.bg;
  const resolvedBorder = borderColor || config.border;
  const resolvedText = textColor || config.text;
  const resolvedIconColor = iconColor || config.icon;

  const handlePress = () => {
    if (disabled) return;
    if (hapticStyle !== 'none') {
      try {
        if (hapticStyle === 'light') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (hapticStyle === 'heavy') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (hapticStyle === 'selection') {
          Haptics.selectionAsync();
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (e) {}
    }
    onPress?.();
  };

  const isOutline = variant === 'outline' || !!borderColor;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled}
      style={[
        config.shadow,
        {
          backgroundColor: resolvedBg,
          borderColor: resolvedBorder,
        },
        style,
      ]}
      className={`flex-1 h-[62px] ${rounded} ${
        isOutline ? 'border border-primary-border' : ''
      } flex-row items-center justify-center gap-2 ${className}`}
    >
      {renderIcon(icon, resolvedIconColor, iconSize)}
      <Text
        style={{ color: resolvedText }}
        className={`text-[14px] font-urbanist-semibold ${textClassName}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
