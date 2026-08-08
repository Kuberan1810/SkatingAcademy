import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  User,
  Edit,
  Call,
  Calendar,
  Card,
  Trash,
} from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/styles/styles';
import { StudentListItem } from '@/features/batches/StudentListScreen/StudentCard';

const { height } = Dimensions.get('window');

export interface StudentOptionsBottomSheetProps {
  visible: boolean;
  student?: StudentListItem | null;
  onClose: () => void;
  onViewProfile?: (student: StudentListItem) => void;
  onEditStudent?: (student: StudentListItem) => void;
  onCallParent?: (student: StudentListItem) => void;
  onAttendanceHistory?: (student: StudentListItem) => void;
  onPaymentHistory?: (student: StudentListItem) => void;
  onDeleteStudent?: (student: StudentListItem) => void;
}

export default function StudentOptionsBottomSheet({
  visible,
  student,
  onClose,
  onViewProfile,
  onEditStudent,
  onCallParent,
  onAttendanceHistory,
  onPaymentHistory,
  onDeleteStudent,
}: StudentOptionsBottomSheetProps) {
  const [showModal, setShowModal] = React.useState(visible);
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 2 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          const opacity = Math.max(0, 1 - gestureState.dy / (height / 2));
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.3) {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: height,
              useNativeDriver: true,
              velocity: gestureState.vy,
              damping: 20,
              mass: 0.6,
              stiffness: 100,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose();
          });
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 6,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 220,
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

  if (!showModal) return null;

  const options = [
    {
      id: 'profile',
      title: 'View Profile',
      icon: User,
      isDanger: false,
      onPress: () => {
        onClose();
        if (student) onViewProfile?.(student);
      },
    },
    {
      id: 'edit',
      title: 'Edit Student',
      icon: Edit,
      isDanger: false,
      onPress: () => {
        onClose();
        if (student) onEditStudent?.(student);
      },
    },
    {
      id: 'call',
      title: 'Call Parent',
      icon: Call,
      isDanger: false,
      onPress: () => {
        onClose();
        if (student) onCallParent?.(student);
      },
    },
    {
      id: 'attendance',
      title: 'Attendance History',
      icon: Calendar,
      isDanger: false,
      onPress: () => {
        onClose();
        if (student) onAttendanceHistory?.(student);
      },
    },
    {
      id: 'payment',
      title: 'Payment History',
      icon: Card,
      isDanger: false,
      onPress: () => {
        onClose();
        if (student) onPaymentHistory?.(student);
      },
    },
    {
      id: 'delete',
      title: 'Delete Student',
      icon: Trash,
      isDanger: true,
      onPress: () => {
        onClose();
        if (student) onDeleteStudent?.(student);
      },
    },
  ];

  return (
    <Modal
      visible={showModal}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={sheetStyles.overlay}>
        {/* Soft Backdrop */}
        <Animated.View style={[sheetStyles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={sheetStyles.backdropTouch}
            activeOpacity={1}
            onPress={onClose}
            className="duration-700"
          />
        </Animated.View>

        {/* Clean White Bottom Sheet */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            sheetStyles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Top Pill Handle */}
          <View style={sheetStyles.dragArea}>
            <View style={sheetStyles.dragHandle} />
          </View>

          {/* Perfectly Aligned Options List */}
          <View className="py-2 gap-1.5">
            {options.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  try {
                    Haptics.impactAsync(
                      item.isDanger
                        ? Haptics.ImpactFeedbackStyle.Medium
                        : Haptics.ImpactFeedbackStyle.Light
                    );
                  } catch (e) {}
                  item.onPress();
                }}
                onLongPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } catch (e) {}
                }}
                delayLongPress={200}
                className="flex-row gap-3 py-3 px-5"
                android_ripple={{
                  color: item.isDanger ? '#FEE2E2' : '#F1F5F9',
                  borderless: false,
                }}
                style={({ pressed }) => [
                  sheetStyles.optionItem,
                  {
                    backgroundColor: pressed
                      ? item.isDanger
                        ? '#FEE2E2'
                        : '#F3F4F6'
                      : 'transparent',
                  },
                ]}
              >
                {/* Left Icon */}
                <item.icon
                  size={22}
                  color={item.isDanger ? COLORS.danger : COLORS.primary}
                  variant="Linear"
                />

                {/* Title Text */}
                <Text
                  style={{ color: item.isDanger ? COLORS.danger : COLORS.primary }}
                  className="text-[16px] font-urbanist-semibold tracking-tight"
                >
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 20,
  },
  dragArea: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 14,
    width: '100%',
  },
});
