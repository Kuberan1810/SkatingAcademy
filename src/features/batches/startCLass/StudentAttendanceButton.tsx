import styles from '@/styles/styles';
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';

export interface SaveAttendanceButtonProps {
  onPress?: () => void;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function SaveAttendanceButton({
  onPress,
  title = 'Save Attendance',
  disabled = false,
  loading = false,
  style,
  className = '',
}: SaveAttendanceButtonProps) {
  return (
    <View style={style} className={`px-5 py-3 w-full bg-white ${className}`}>
      <TouchableOpacity
        style={[styles.InnerShadowStyle]}
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        className={`w-full py-4 rounded-[14px] bg-[#1E7D46] justify-center items-center ${disabled ? 'opacity-50' : 'active:bg-[#165c33]'
          }`}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="text-[16px] font-urbanist-semibold text-white text-center">
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
