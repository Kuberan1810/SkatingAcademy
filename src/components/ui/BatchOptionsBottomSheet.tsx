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
  Eye,
  Edit,
  Profile2User,
  Trash,
} from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/styles/styles';

const { height } = Dimensions.get('window');

export interface BatchItemData {
  id: string;
  title: string;
  time?: string;
  studentsCount?: number | string;
  date?: string;
  status?: string;
}

export interface BatchOptionsBottomSheetProps {
  visible: boolean;
  batch?: BatchItemData | null;
  onClose: () => void;
  onViewDetails?: (batch: BatchItemData) => void;
  onEditBatch?: (batch: BatchItemData) => void;
  onManageAttendance?: (batch: BatchItemData) => void;
  onDeleteBatch?: (batch: BatchItemData) => void;
}

export default function BatchOptionsBottomSheet({
  visible,
  batch,
  onClose,
  onViewDetails,
  onEditBatch,
  onManageAttendance,
  onDeleteBatch,
}: BatchOptionsBottomSheetProps) {
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      id: 'view',
      title: 'View Details',
      icon: Eye,
      isDanger: false,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
        if (batch) onViewDetails?.(batch);
      },
    },
    {
      id: 'edit',
      title: 'Edit Batch',
      icon: Edit,
      isDanger: false,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
        if (batch) onEditBatch?.(batch);
      },
    },
    {
      id: 'attendance',
      title: 'Manage Attendance',
      icon: Profile2User,
      isDanger: false,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
        if (batch) onManageAttendance?.(batch);
      },
    },
    {
      id: 'delete',
      title: 'Delete Batch',
      icon: Trash,
      isDanger: true,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onClose();
        if (batch) onDeleteBatch?.(batch);
      },
    },
  ];

  return (
    <Modal
      visible={showModal}
      transparent
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
          />
        </Animated.View>

        {/* Clean YouTube-Style White Bottom Sheet */}
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

          {/* Perfectly Aligned Options List with Smooth Gray Hover/Press State */}
          <View className="py-2 gap-1.5 ">
            {options.map((item) => (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                className='flex-row  gap-3 py-3 px-5'
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
                {/* Left Icon directly aligned on left */}
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
