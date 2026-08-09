import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { TickCircle, Calendar } from 'iconsax-react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import styles from '@/styles/styles';
import PrimaryBtn from '@/components/ui/PrimaryBtn';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ALL_DAYS = [
  { id: 'Mon', label: 'Monday', short: 'Mon' },
  { id: 'Tue', label: 'Tuesday', short: 'Tue' },
  { id: 'Wed', label: 'Wednesday', short: 'Wed' },
  { id: 'Thu', label: 'Thursday', short: 'Thu' },
  { id: 'Fri', label: 'Friday', short: 'Fri' },
  { id: 'Sat', label: 'Saturday', short: 'Sat' },
  { id: 'Sun', label: 'Sunday', short: 'Sun' },
];

const PRESETS = [
  { label: 'Weekend', days: ['Sat', 'Sun'] },
  { label: 'Mon, Wed, Fri', days: ['Mon', 'Wed', 'Fri'] },
  { label: 'Tue, Thu, Sat', days: ['Tue', 'Thu', 'Sat'] },
  { label: 'Weekdays', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { label: 'All Days', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
];

export interface TrainingDaysPickerModalProps {
  visible: boolean;
  selectedDaysString: string;
  onSelect: (daysString: string) => void;
  onClose: () => void;
}

export default function TrainingDaysPickerModal({
  visible,
  selectedDaysString,
  onSelect,
  onClose,
}: TrainingDaysPickerModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Parse incoming string e.g. "Mon, Wed, Fri" into array of short day IDs
  useEffect(() => {
    if (visible) {
      if (selectedDaysString) {
        const parsed = selectedDaysString
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        setSelectedDays(parsed);
      } else {
        setSelectedDays(['Sat', 'Sun']);
      }
    }
  }, [visible, selectedDaysString]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return gestureState.dy > 15 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
          const opacity = Math.max(0, 1 - gestureState.dy / (SCREEN_HEIGHT / 2));
          fadeAnim.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60 || gestureState.vy > 0.3) {
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: SCREEN_HEIGHT,
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
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 65,
              friction: 11,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 150,
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
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (showModal) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
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
      });
    }
  }, [visible]);

  if (!showModal && !visible) {
    return null;
  }

  const handleClose = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
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

  const toggleDay = (short: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    setSelectedDays((prev) => {
      if (prev.includes(short)) {
        return prev.filter((d) => d !== short);
      } else {
        // Keep in chronological order
        const dayOrder = ALL_DAYS.map((d) => d.short);
        const next = [...prev, short];
        return next.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
      }
    });
  };

  const applyPreset = (days: string[]) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    setSelectedDays(days);
  };

  const handleConfirm = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    const formatted = selectedDays.join(', ');
    onSelect(formatted);
    handleClose();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="z-50 justify-end">
      {/* Dimmed Overlay Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Animated Bottom Sheet Container */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateY: slideAnim }],
          maxHeight: SCREEN_HEIGHT * 0.85,
        }}
        className="bg-white rounded-t-[32px] w-full px-6 pt-3 pb-8"
      >
        {/* Drag Indicator Notch */}
        <View className="w-12 h-1.5 bg-[#E5E7EB] rounded-full self-center mb-4" />

        {/* Header with Title & Close Button */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2.5">
        
            <View>
              <Text className="text-[18px] font-urbanist-bold text-primary">
                Select Training Days
              </Text>
              <Text className="text-[13px] font-urbanist-medium text-secondary">
                {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} selected per week
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            className="w-9 h-9 rounded-full bg-[#F3F4F6] items-center justify-center"
          >
            <X size={18} color="#6B7280" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Quick Presets Scroll Row */}
        <View className="mb-4">
          <Text className="text-[12px] font-urbanist-semibold text-secondary uppercase tracking-wider mb-2">
            Quick Presets
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {PRESETS.map((preset) => {
              const isActive =
                preset.days.length === selectedDays.length &&
                preset.days.every((d) => selectedDays.includes(d));

              return (
                <TouchableOpacity
                  key={preset.label}
                  activeOpacity={0.75}
                  onPress={() => applyPreset(preset.days)}
                  className={`px-3.5 py-2 rounded-full border mr-2 ${
                    isActive
                      ? 'bg-[#4186F7] border-[#4186F7]'
                      : 'bg-[#F9FAFB] border-primary-border'
                  }`}
                >
                  <Text
                    className={`text-[13px] font-urbanist-semibold ${
                      isActive ? 'text-white' : 'text-[#374151]'
                    }`}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List of 7 Days */}
        <View className="gap-2.5 mb-6">
          {ALL_DAYS.map((day) => {
            const isSelected = selectedDays.includes(day.short);

            return (
              <TouchableOpacity
                key={day.id}
                activeOpacity={0.8}
                onPress={() => toggleDay(day.short)}
                className={`h-[52px] rounded-[16px] px-4 flex-row items-center justify-between border ${
                  isSelected
                    ? 'bg-[#F0F7FF] border-[#4186F7]'
                    : 'bg-[#FAFAFA] border-primary-border'
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center ${
                      isSelected ? 'bg-[#4186F7]' : 'bg-[#E5E7EB]'
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-urbanist-bold ${
                        isSelected ? 'text-white' : 'text-[#6B7280]'
                      }`}
                    >
                      {day.short[0]}
                    </Text>
                  </View>
                  <Text
                    className={`text-[15px] font-urbanist-semibold ${
                      isSelected ? 'text-[#1D4ED8]' : 'text-primary'
                    }`}
                  >
                    {day.label}
                  </Text>
                </View>

                {isSelected ? (
                  <TickCircle size={22} color="#4186F7" variant="Bold" />
                ) : (
                  <View className="w-5 h-5 rounded-full border-2 border-[#D1D5DB]" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Confirm Selection Button */}
        <PrimaryBtn
          label={
            selectedDays.length > 0
              ? `Confirm (${selectedDays.join(', ')})`
              : 'Select at least 1 day'
          }
          bgColor="#4186F7"
          textColor="#fff"
          className="h-[50px]"
          disabled={selectedDays.length === 0}
          onPress={handleConfirm}
        />
      </Animated.View>
    </View>
  );
}
