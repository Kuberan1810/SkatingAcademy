import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  ActivityIndicator,
} from 'react-native';
import styles, { COLORS } from '@/styles/styles';

export type PrimaryBtnVariant = 'black' | 'green' | 'default' | 'outline' | 'white';

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
  /** Loading state */
  loading?: boolean;
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
  loading = false,
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
      case 'white':
        return '#FFFFFF';
      case 'black':
      default:
        return '#0E0E0E';
    }
  };

  const background = getBackgroundColor();
  const isOutline = variant === 'outline';
  const isWhite = isOutline || variant === 'white' || background === '#FFFFFF' || background === 'white';

  const shadowStyle = isWhite ? styles.BlackInnerShadowStyle : styles.InnerShadowStyle;
  const finalTextColor = isOutline || variant === 'white' ? COLORS.primary : textColor;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        shadowStyle,
        {
          backgroundColor: background,
          borderColor: isOutline ? COLORS.primaryBorder || '#F2EEF4' : undefined,
          borderWidth: isOutline ? 1 : 0,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      className={`p-3.5 rounded-[16px] flex-row items-center justify-center px-4 gap-2 ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={finalTextColor} size="small" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon size={20} color={finalTextColor} />
          )}
          <Text
            style={[{ color: finalTextColor }, textStyle]}
            className="text-[16px] font-urbanist-semibold tracking-tight"
          >
            {label}
          </Text>
          {Icon && iconPosition === 'right' && (
            <Icon size={20} color={finalTextColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}