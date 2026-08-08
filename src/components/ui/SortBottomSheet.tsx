import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  ArrowLeft2,
  ArrowUp2,
  ArrowDown2,
  Calendar,
  Diagram,
  Profile2User,
  Element4,
} from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import PrimaryBtn from '@/components/ui/PrimaryBtn';

const { height } = Dimensions.get('window');

export interface SortOptionItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  directionText?: string;
  isAscending?: boolean;
}

export interface SortBottomSheetProps {
  visible: boolean;
  title?: string;
  options: SortOptionItem[];
  selectedOptionId: string;
  onSelectOption: (optionId: string) => void;
  onClose: () => void;
}

function getOptionIcon(opt: SortOptionItem) {
  if (opt.icon) return opt.icon;
  const lower = (opt.label + ' ' + opt.id).toLowerCase();
  if (
    lower.includes('date') ||
    lower.includes('joined') ||
    lower.includes('time')
  ) {
    return Calendar;
  }
  if (
    lower.includes('amount') ||
    lower.includes('fee') ||
    lower.includes('price') ||
    lower.includes('attendance')
  ) {
    return Diagram;
  }
  if (lower.includes('name') || lower.includes('student')) {
    return Profile2User;
  }
  return Element4;
}

export default function SortBottomSheet({
  visible,
  title = 'Sort by',
  options,
  selectedOptionId,
  onSelectOption,
  onClose,
}: SortBottomSheetProps) {
  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
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
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: height,
              useNativeDriver: true,
              velocity: gestureState.vy,
              damping: 22,
              mass: 0.6,
              stiffness: 120,
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
              bounciness: 5,
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
      setShowModal(true);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
          mass: 0.8,
          stiffness: 130,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  if (!showModal) return null;

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
          />
        </Animated.View>

        {/* Clean White Bottom Sheet Container */}
        <Animated.View
          style={[
            sheetStyles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Drag Handle Bar */}
          <View style={sheetStyles.dragArea} {...panResponder.panHandlers}>
            <View style={sheetStyles.dragHandle} />
          </View>

          {/* Header Row with Chevron & Title */}
          <View style={sheetStyles.headerRow}>
            
            <Text
              style={sheetStyles.headerTitle}
              className="text-[22px] font-urbanist-bold text-[#111827] px-5"
            >
              {title}
            </Text>
          </View>

          {/* Options List */}
          <View className="py-1 gap-1">
            {options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const OptionIcon = getOptionIcon(opt);
              const directionText = opt.directionText || opt.subtitle || '';
              const isAsc = opt.isAscending !== false;

              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch (e) {}
                    onSelectOption(opt.id);
                    onClose();
                  }}
                  onLongPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    } catch (e) {}
                  }}
                  delayLongPress={200}
                  android_ripple={{ color: '#F5F5F5', borderless: false }}
                  className="flex-row items-center justify-between py-3.5  rounded-xl px-5"
                  style={({ pressed }) => [
                    sheetStyles.optionItem,
                    {
                      backgroundColor: pressed
                        ? isSelected
                          ? '#F5F5F5'
                          : '#EFF6FF'
                        : isSelected
                        ? '#F8FAFC'
                        : 'transparent',
                    },
                  ]}
                >
                  {/* Left Side: Icon + Label */}
                  <View className="flex-row items-center gap-3.5 flex-1">
                    {/* <OptionIcon size={22} color="#111827" variant="Linear" /> */}
                    <Text className="text-[16px] font-urbanist-semibold text-[#111827]">
                      {opt.label}
                    </Text>
                  </View>

                  {/* Right Side: Direction Text & Purple Arrow (Only if selected) */}
                  {isSelected && (
                    <View className="flex-row items-center gap-1.5">
                      {directionText ? (
                        <Text className="text-[14px] font-urbanist-medium text-[#1546e9]">
                          {directionText}
                        </Text>
                      ) : null}
                      {isAsc ? (
                        <ArrowUp2 size={18} color="#1546e9" variant="Bold" />
                      ) : (
                        <ArrowDown2 size={18} color="#1546e9" variant="Bold" />
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Done Button using project PrimaryBtn */}
          <View className="mt-4 mb-2 px-5">
            <PrimaryBtn
              label="Done"
              variant="black"
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch (e) {}
                onClose();
              }}
            />
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
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000000',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    color: '#111827',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    width: '100%',
  },
});





