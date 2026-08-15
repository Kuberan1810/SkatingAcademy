import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { TickCircle, InfoCircle, Trash } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import styles from '@/styles/styles';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'delete' | 'info';
  onDismiss?: () => void;
  duration?: number;
}

export default function Toast({
  visible,
  message,
  type = 'success',
  onDismiss,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (visible) {
      try {
        if (type === 'delete' || type === 'error') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (e) {}

      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, type, duration, onDismiss]);

  if (!visible) return null;

  const isDelete = type === 'delete';
  const isError = type === 'error';

  const bgColor = isDelete || isError ? '#FEF2F2' : '#F0FDF4';
  const borderColor = isDelete || isError ? '#FCA5A5' : '#86EFAC';
  const textColor = isDelete || isError ? '#991B1B' : '#166534';
  const iconColor = isDelete || isError ? '#EF4444' : '#22C55E';

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(200)}
      className="absolute top-12 left-5 right-5 z-[99999] elevation-[99]"
      pointerEvents="none"
    >
      <View
        style={[
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: 1,
          },
        
        ]}
        className="px-4 py-3.5 rounded-[18px] flex-row items-center gap-3"
      >
        <View className="items-center justify-center">
          {isDelete ? (
            <Trash size={22} color={iconColor} variant="Bold" />
          ) : isError ? (
            <InfoCircle size={22} color={iconColor} variant="Bold" />
          ) : (
            <TickCircle size={22} color={iconColor} variant="Bold" />
          )}
        </View>
        <Text
          style={{ color: textColor }}
          className="flex-1 text-[14px] font-urbanist-bold tracking-tight"
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
