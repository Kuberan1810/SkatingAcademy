import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Danger } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import styles from '@/styles/styles';

const { height } = Dimensions.get('window');

export interface ExitClassAlertSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExitClassAlertSheet({
  visible,
  title = 'Exit Class Session?',
  message = 'Are you sure you want to leave? If you exit now, this session will automatically be marked empty and you will not be able to restart it.',
  confirmText = 'Yes, Exit',
  cancelText = 'Stay in Session',
  onClose,
  onConfirm,
}: ExitClassAlertSheetProps) {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Seamless 1:1 free drag PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 1 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 2 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          const opacity = Math.max(0, 1 - gestureState.dy / (height * 0.5));
          fadeAnim.setValue(opacity);
        } else {
          slideAnim.setValue(gestureState.dy * 0.18);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 70 || gestureState.vy > 0.35) {
          closeModal();
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
              tension: 68,
              friction: 10,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
      setShowModal(true);
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          mass: 0.8,
          stiffness: 110,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (showModal) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowModal(false));
    }
  }, [visible]);

  const closeModal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  const handleConfirm = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onConfirm();
    });
  };

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <View style={sheetStyles.overlayWrapper}>
        {/* Backdrop */}
        <Animated.View style={[sheetStyles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={sheetStyles.backdropTouch}
            activeOpacity={1}
            onPress={closeModal}
          />
        </Animated.View>

        {/* Bottom Sheet Container */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            sheetStyles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Drag Handle */}
          <View style={sheetStyles.dragArea}>
            <View style={sheetStyles.dragHandle} />
          </View>

          {/* Sheet Body */}
          <View className="items-center px-6 pt-1">
            {/* Warning Icon Badge */}
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
              <Danger size={32} color="#EF4444" variant="Bold" />
            </View>

            {/* Title */}
            <Text className="text-[20px] font-urbanist-bold text-primary mb-2 text-center">
              {title}
            </Text>

            {/* Note / Message */}
            <Text className="text-[14px] font-urbanist-medium text-secondary text-center mb-8 px-2 leading-5">
              {message}
            </Text>

            {/* Action Buttons */}
            <View className="flex-row items-center gap-3 w-full">
              {/* Stay / Cancel Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                className="flex-1 py-4 rounded-[15px] items-center border border-primary-border bg-white"
                onPress={closeModal}
                style={[styles.BlackInnerShadowStyle]}
              >
                <Text className="text-[#626262] font-urbanist-semibold text-[15px]">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              {/* Exit / Confirm Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                className="flex-1 py-4 bg-red-500 rounded-[15px] items-center justify-center flex-row gap-2"
                onPress={handleConfirm}
                style={[styles.InnerShadowStyle]}
              >
                <Text className="text-white font-urbanist-semibold text-[15px]">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 20,
  },
  dragArea: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
});
