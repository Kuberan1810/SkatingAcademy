import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { TickCircle, InfoCircle, Trash } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'delete' | 'info';
  onDismiss?: () => void;
  duration?: number;
}

type ToastState = ToastProps | null;
type ToastListener = (toast: ToastState) => void;

let listeners: ToastListener[] = [];
let currentToast: ToastState = null;

export const toastManager = {
  show: (toast: ToastProps) => {
    currentToast = toast;
    listeners.forEach((listener) => listener(currentToast));
  },
  hide: () => {
    if (currentToast) {
      currentToast.onDismiss?.();
      currentToast = null;
      listeners.forEach((listener) => listener(null));
    }
  },
  subscribe: (listener: ToastListener) => {
    listeners.push(listener);
    if (currentToast) {
      listener(currentToast);
    }
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

/**
 * Root ToastContainer that sits at the very top of the app layout in _layout.tsx
 */
export function ToastContainer() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    return toastManager.subscribe((t) => {
      setToast(t ? { ...t } : null);
    });
  }, []);

  useEffect(() => {
    if (toast?.visible) {
      try {
        if (toast.type === 'delete' || toast.type === 'error') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (e) {}

      const timer = setTimeout(() => {
        toastManager.hide();
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast?.visible, toast?.message, toast?.type]);

  if (!toast?.visible) return null;

  const isDelete = toast.type === 'delete';
  const isError = toast.type === 'error';

  const bgColor = isDelete || isError ? '#FEF2F2' : '#F0FDF4';
  const borderColor = isDelete || isError ? '#FCA5A5' : '#86EFAC';
  const textColor = isDelete || isError ? '#991B1B' : '#166534';
  const iconColor = isDelete || isError ? '#EF4444' : '#22C55E';

  const topPosition = Math.max(insets.top, 16) + 6;

  return (
    <View
      style={[styles.toastWrapper, { top: topPosition }]}
      pointerEvents="box-none"
    >
      <Animated.View
        entering={FadeInUp.duration(250)}
        exiting={FadeOutUp.duration(200)}
        style={{ width: '100%' }}
        pointerEvents="auto"
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toastManager.hide()}
          style={[
            {
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: 1,
            },
            styles.toastCard,
          ]}
          className="px-4 py-3.5 rounded-[18px] flex-row items-center gap-3 shadow-lg"
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
            {toast.message}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/**
 * Reusable <Toast ... /> component rendered inside any screen
 */
export default function Toast({
  visible,
  message,
  type = 'success',
  onDismiss,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (visible) {
      toastManager.show({ visible, message, type, onDismiss, duration });
    } else {
      toastManager.hide();
    }
  }, [visible, message, type, onDismiss, duration]);

  return null;
}

Toast.show = (props: ToastProps) => toastManager.show(props);
Toast.hide = () => toastManager.hide();

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 999999,
    elevation: 99999,
    alignItems: 'center',
  },
  toastCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
});
