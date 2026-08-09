import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import styles from '@/styles/styles';

const { height } = Dimensions.get('window');

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface DatePickerModalProps {
  visible: boolean;
  title?: string;
  summaryLabel?: string;
  value?: string; // Formatted as "DD / MM / YYYY"
  defaultToCurrentYear?: boolean;
  onSelect: (formattedDate: string) => void;
  onClose: () => void;
}

export default function DatePickerModal({
  visible,
  title = 'Select Date of Birth',
  summaryLabel = 'Selected Date',
  value,
  defaultToCurrentYear = false,
  onSelect,
  onClose,
}: DatePickerModalProps) {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Safe Date Parser
  const parseInitialDate = () => {
    if (value && typeof value === 'string' && value.includes('/')) {
      const parts = value.split('/').map((p) => parseInt(p.trim(), 10));
      if (
        parts.length === 3 &&
        !isNaN(parts[0]) &&
        parts[0] >= 1 &&
        parts[0] <= 31 &&
        !isNaN(parts[1]) &&
        parts[1] >= 1 &&
        parts[1] <= 12 &&
        !isNaN(parts[2]) &&
        parts[2] >= 1900
      ) {
        return {
          day: parts[0],
          month: parts[1] - 1, // 0-indexed
          year: parts[2],
        };
      }
    }
    const today = new Date();
    return {
      day: today.getDate(),
      month: today.getMonth(),
      year: defaultToCurrentYear ? today.getFullYear() : today.getFullYear() - 8,
    };
  };

  const initial = parseInitialDate();
  const [selectedDay, setSelectedDay] = useState(initial.day);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  // Sync state when opened
  useEffect(() => {
    if (visible) {
      const parsed = parseInitialDate();
      setSelectedDay(parsed.day);
      setSelectedMonth(parsed.month);
      setSelectedYear(parsed.year);
      setIsYearPickerOpen(false);
    }
  }, [visible, value, defaultToCurrentYear]);

  // Generate Year list from 1990 to current year
  const currentYear = new Date().getFullYear();
  const yearList = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= 1990; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    if (isNaN(selectedYear) || isNaN(selectedMonth)) return 31;
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayOfMonth = useMemo(() => {
    if (isNaN(selectedYear) || isNaN(selectedMonth)) return 0;
    return new Date(selectedYear, selectedMonth, 1).getDay();
  }, [selectedYear, selectedMonth]);

  const currentMonthName = useMemo(() => {
    if (selectedMonth >= 0 && selectedMonth < 12) {
      return MONTH_NAMES[selectedMonth];
    }
    return 'January';
  }, [selectedMonth]);

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
            if (onClose) onClose();
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

  useEffect(() => {
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

  const handlePrevMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setSelectedDay(dayNum);
  };

  const handleConfirmDate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const effectiveDay = Math.min(selectedDay || 1, maxDays);

    const dd = String(effectiveDay).padStart(2, '0');
    const mm = String(selectedMonth + 1).padStart(2, '0');
    const yyyy = selectedYear;
    const formatted = `${dd} / ${mm} / ${yyyy}`;

    if (onSelect) {
      onSelect(formatted);
    }
    if (onClose) {
      onClose();
    }
  };

  if (!showModal) return null;

  return (
    <View style={sheetStyles.overlayWrapper}>
      {/* Soft Backdrop */}
      <Animated.View style={[sheetStyles.backdrop, { opacity: fadeAnim }]}>
        <Pressable
          style={sheetStyles.backdropTouch}
          onPress={onClose}
        />
      </Animated.View>

      {/* Animated Bottom Sheet */}
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

        {/* Header Title Bar */}
        <View className="flex-row items-center justify-between px-5 mb-3">
          <Text className="text-[18px] font-urbanist-bold text-primary">
            {title}
          </Text>

          <Pressable
            onPress={onClose}
            className="p-1.5 rounded-full active:bg-gray-100"
          >
            <X size={20} color="#626262" />
          </Pressable>
        </View>

        {/* Date & Month Selection Controls */}
        <View className="px-5 mb-2">
          <View className="flex-row items-center justify-between bg-[#F8FAFC] border border-gray-100 rounded-2xl p-3 px-3 mb-3">
            {/* Month Navigator Previous */}
            <Pressable
              onPress={handlePrevMonth}
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 active:bg-gray-100 items-center justify-center shadow-xs"
            >
              <ArrowLeft2 size={16} color="#374151" variant="Linear" />
            </Pressable>

            {/* Month & Year Title Click to switch year */}
            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {}
                setIsYearPickerOpen(!isYearPickerOpen);
              }}
              className="flex-row items-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-gray-200 active:bg-gray-100 shadow-xs"
            >
              <Text className="text-[15px] font-urbanist-bold text-primary">
                {currentMonthName} {selectedYear}
              </Text>
              <Text className="text-[11px] font-urbanist-medium text-[#333333] bg-[#f5f5f5] px-1.5 py-1 rounded-md border border-gray-200">
                {isYearPickerOpen ? 'Done' : 'Change Year'}
              </Text>
            </Pressable>

            {/* Month Navigator Next */}
            <Pressable
              onPress={handleNextMonth}
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 active:bg-gray-100 items-center justify-center shadow-xs"
            >
              <ArrowRight2 size={16} color="#374151" variant="Linear" />
            </Pressable>
          </View>

          {/* Quick Year Selector Grid (when year picker open) */}
          {isYearPickerOpen ? (
            <View className="h-[240px] bg-white border border-gray-100 rounded-2xl p-2 mb-3">
              <Text className="text-[13px] font-urbanist-semibold text-secondary px-2 mb-2">
                Select Birth Year:
              </Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  padding: 4,
                }}
              >
                {yearList.map((yr) => {
                  const isSelected = selectedYear === yr;
                  return (
                    <Pressable
                      key={yr}
                      onPress={() => {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (e) {}
                        setSelectedYear(yr);
                        setIsYearPickerOpen(false);
                      }}
                      style={{ width: '22%' }}
                      className={`py-2.5 rounded-xl items-center justify-center border ${
                        isSelected
                          ? 'bg-[#333333] border-[#333333]'
                          : 'bg-gray-50 border-gray-200 active:bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-[14px] font-urbanist-bold ${
                          isSelected ? 'text-white' : 'text-primary'
                        }`}
                      >
                        {yr}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View className="bg-white border border-gray-100 rounded-2xl p-3 mb-3">
              {/* Weekday Labels */}
              <View className="flex-row items-center justify-between mb-2">
                {WEEK_DAYS.map((day, idx) => (
                  <View key={idx} className="w-[13%] items-center">
                    <Text className="text-[13px] font-urbanist-bold text-gray-400">
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Day Numbers Grid */}
              <View className="flex-row flex-wrap">
                {/* Empty offset padding for first day */}
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <View key={`empty-${idx}`} style={{ width: '14.28%', height: 38 }} />
                ))}

                {/* Day Buttons */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isSelected = selectedDay === dayNum;

                  return (
                    <View
                      key={`day-${dayNum}`}
                      style={{ width: '14.28%', height: 38, padding: 2 }}
                    >
                      <Pressable
                        onPress={() => handleSelectDay(dayNum)}
                        className={`flex-1 rounded-full items-center justify-center ${
                          isSelected
                            ? 'bg-[#333333]'
                            : 'bg-transparent active:bg-gray-100'
                          }`}
                        style={isSelected ? [styles.InnerShadowStyle] : undefined}
                      >
                        <Text
                          className={`text-[14px] ${
                            isSelected
                              ? 'font-urbanist-bold text-white'
                              : 'font-urbanist-semibold text-primary'
                          }`}
                        >
                          {dayNum}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Selected Date Summary & Confirm Action */}
          <View className="flex-row items-center justify-between gap-3 pt-1">
            <View className="flex-1 bg-[#F8FAFC] border border-gray-200/80 rounded-2xl py-2.5 px-4 justify-center">
              <Text className="text-[11px] font-urbanist-medium text-secondary uppercase tracking-wider">
                {summaryLabel}
              </Text>
              <Text className="text-[15px] font-urbanist-bold text-primary">
                {String(selectedDay || 1).padStart(2, '0')}{' '}
                {currentMonthName} {selectedYear}
              </Text>
            </View>

            <Pressable
             
              style={[styles.InnerShadowStyle]}
              onPress={handleConfirmDate}
              className="h-[50px] px-10 bg-[#333333] active:bg-[#1f1f1f] rounded-2xl items-center justify-center flex-row gap-2 shadow-md"
            >
              <Text className="text-[15px] font-urbanist-bold text-white">
                Confirm Date
              </Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
    marginBottom: 2,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
});
