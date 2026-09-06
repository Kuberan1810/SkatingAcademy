import React, { useState, useEffect } from 'react';
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
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {
  CalendarAdd,
  Calendar,
  Clock,
  InfoCircle,
  TickCircle,
} from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import styles, { COLORS } from '@/styles/styles';
import DatePickerModal from '@/features/creation/studentCreation/components/DatePickerModal';
import { useCreateCompensationSchedule } from '@/hooks/use-schedule';
import { getErrorMessage } from '@/utils/error';
import { X } from 'lucide-react-native';

const { height } = Dimensions.get('window');

const REASON_PRESETS = [
  'Rain Compensation',
  'Holiday Compensation',
  'Tournament Practice',
  'Special Session',
  'Exam Leave Compensation',
];

export interface BatchCompensationItem {
  id: string | number;
  title: string;
  time?: string;
  studentsCount?: number | string;
}

export interface ScheduleCompensationModalProps {
  visible: boolean;
  batch?: BatchCompensationItem | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

// Convert Date object to "DD / MM / YYYY"
const formatDateToDisplay = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
};

// Convert "DD / MM / YYYY" to "YYYY-MM-DD" for API payload
const formatDisplayToYYYYMMDD = (val: string): string => {
  if (!val || !val.includes('/')) return '';
  const parts = val.split('/').map((p) => p.trim());
  if (parts.length === 3) {
    const dd = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    const yyyy = parts[2];
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
};

export default function ScheduleCompensationModal({
  visible,
  batch,
  onClose,
  onSuccess,
}: ScheduleCompensationModalProps) {
  const [showModal, setShowModal] = useState(visible);
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Form State
  const [compensationDate, setCompensationDate] = useState<string>(() =>
    formatDateToDisplay(new Date())
  );
  const [originalDate, setOriginalDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // DatePicker state
  const [activeDatePicker, setActiveDatePicker] = useState<
    'compensation' | 'original' | null
  >(null);

  const createCompensationMutation = useCreateCompensationSchedule();

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 8 &&
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

  useEffect(() => {
    if (visible) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
      setShowModal(true);
      setCompensationDate(formatDateToDisplay(new Date()));
      setOriginalDate('');
      setReason('');
      setApiError(null);
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

  const handleSelectPreset = (presetText: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setReason(presetText);
  };

  const handleSubmit = async () => {
    setApiError(null);

    const compDateIso = formatDisplayToYYYYMMDD(compensationDate);
    if (!compDateIso) {
      setApiError('Please select a valid class date');
      return;
    } 

    const batchIdNum = Number(batch?.id);
    if (!batchIdNum || isNaN(batchIdNum)) {
      setApiError('Invalid batch selected');
      return;
    }

    const origDateIso = originalDate
      ? formatDisplayToYYYYMMDD(originalDate)
      : null;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    createCompensationMutation.mutate(
      {
        batch_id: batchIdNum,
        compensation_date: compDateIso,
        original_date: origDateIso || undefined,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          try {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
          } catch (e) {}
          onSuccess?.(
            `Extra class scheduled for ${data.batch_name || batch?.title} on ${data.compensation_date}!`
          );
          onClose();
        },
        onError: (err) => {
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch (e) {}
          const msg = getErrorMessage(
            err,
            'Failed to create extra class schedule'
          );
          setApiError(msg);
        },
      }
    );
  };

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

        {/* Modal Container */}
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

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            >
              {/* Header Title */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-[20px] font-urbanist-bold text-primary tracking-tight">
                    Schedule Extra Class
                  </Text>
                  <Text className="text-[14px] font-urbanist-medium text-secondary mt-0.5">
                    Create an extra or compensation session
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                >
                  <X size={22} color="#626262"/>
                </TouchableOpacity>
              </View>

              {/* Batch Card Banner */}
              {!!batch && (
                <View
                
                  className="flex-row items-center justify-between p-3.5 mb-4 border border-primary-border rounded-2xl bg-[#F8FAFC]"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-[12px] font-urbanist-medium text-secondary uppercase tracking-wider">
                      Selected Batch
                    </Text>
                    <Text className="text-[17px] font-urbanist-bold text-primary mt-0.5">
                      {batch.title}
                    </Text>
                  </View>
                  {!!batch.time && (
                    <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200">
                      <Clock size={13} color="#626262" variant="Linear" />
                      <Text className="text-[13px] font-urbanist-medium text-secondary">
                        {batch.time}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* API Error Notification */}
              {!!apiError && (
                <View className="p-3 mb-4 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] flex-row items-center gap-2.5">
                  <InfoCircle size={18} color="#DC2626" variant="Bold" />
                  <Text className="flex-1 text-[13px] font-urbanist-medium text-[#B91C1C]">
                    {apiError}
                  </Text>
                </View>
              )}

              {/* 1. Compensation / Extra Class Date (Required) */}
              <View className="mb-4">
                <Text className="text-[14px] font-urbanist-semibold text-primary mb-1.5">
                  Class Date <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveDatePicker('compensation')}
                  style={styles.BoxStyle}
                  className="flex-row items-center justify-between px-4 py-3.5"
                >
                  <View className="flex-row items-center gap-3">
                    <CalendarAdd size={20} color="#0E0E0E" variant="Linear" />
                    <Text className="text-[15px] font-urbanist-semibold text-primary">
                      {compensationDate || 'Select Date'}
                    </Text>
                  </View>
                  <Text className="text-[12px] font-urbanist-medium text-[#4186F7]">
                    Change
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 2. Missed / Leave Date (Optional) */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-[14px] font-urbanist-semibold text-primary">
                    Missed Date <Text className="text-secondary font-urbanist-regular">(Optional)</Text>
                  </Text>
                  {!!originalDate && (
                    <TouchableOpacity
                      onPress={() => setOriginalDate('')}
                      className="px-2 py-0.5 rounded-md bg-gray-100"
                    >
                      <Text className="text-[11px] font-urbanist-medium text-red-500">
                        Clear
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveDatePicker('original')}
                  style={styles.BoxStyle}
                  className="flex-row items-center justify-between px-4 py-3.5"
                >
                  <View className="flex-row items-center gap-3">
                    <Calendar size={20} color="#626262" variant="Linear" />
                    <Text
                      className={`text-[15px] font-urbanist-medium ${
                        originalDate ? 'text-primary font-urbanist-semibold' : 'text-gray-400'
                      }`}
                    >
                      {originalDate || 'Auto-detect missed date or leave empty'}
                    </Text>
                  </View>
                  <Text className="text-[12px] font-urbanist-medium text-[#4186F7]">
                    {originalDate ? 'Change' : 'Pick Date'}
                  </Text>
                </TouchableOpacity>

                {/* <Text className="text-[12px] font-urbanist-regular text-secondary mt-1 px-1">
                  Leave empty if this is an extra special / tournament practice session.
                </Text> */}
              </View>

              {/* 3. Reason / Notes */}
              <View className="mb-4">
                <Text className="text-[14px] font-urbanist-semibold text-primary mb-1.5">
                  Reason / Purpose <Text className="text-secondary font-urbanist-regular">(Optional)</Text>
                </Text>

                {/* Quick Presets */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, marginBottom: 8 }}
                >
                  {REASON_PRESETS.map((preset) => {
                    const isSelected = reason === preset;
                    return (
                      <TouchableOpacity
                        key={preset}
                        activeOpacity={0.7}
                        style={isSelected ? [styles.InnerShadowStyle] : undefined}
                        onPress={() => handleSelectPreset(preset)}
                        className={`px-3 py-2 rounded-full border ${
                          isSelected
                            ? 'bg-[#0E0E0E] border-[#0E0E0E]'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-[12px] ${
                            isSelected
                              ? 'font-urbanist-semibold text-white'
                              : 'font-urbanist-medium text-secondary'
                          }`}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g. Rain leave compensation, Tournament practice"
                  placeholderTextColor="#9CA3AF"
                  className="px-4 py-3 border border-primary-border rounded-[10px] bg-white text-[14px] font-urbanist-medium text-primary mt-1"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row items-center gap-3 mt-2">
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.BlackInnerShadowStyle]}
                  disabled={createCompensationMutation.isPending}
                  onPress={onClose}
                  className="flex-1 h-[52px] rounded-[18px] bg-white items-center justify-center border border-gray-200"
                >
                  <Text className="text-[15px] font-urbanist-semibold text-primary">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={createCompensationMutation.isPending}
                  onPress={handleSubmit}
                  style={[{ backgroundColor: '#0E0E0E' }, styles.InnerShadowStyle]}
                  className="flex-1 h-[52px] rounded-[18px] items-center justify-center flex-row gap-2 shadow-md"
                >
                  {createCompensationMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <TickCircle size={18} color="#FFFFFF" variant="Bold" />
                      <Text className="text-[15px] font-urbanist-bold text-white">
                        Schedule Class
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>

        {/* Date Picker Modal for Compensation or Original date */}
        <DatePickerModal
          visible={!!activeDatePicker}
          title={
            activeDatePicker === 'compensation'
              ? 'Select Class Date'
              : 'Select Missed Date'
          }
          summaryLabel="Selected Date"
          value={
            activeDatePicker === 'compensation'
              ? compensationDate
              : originalDate || formatDateToDisplay(new Date())
          }
          defaultToCurrentYear={true}
          onSelect={(formattedDate) => {
            if (activeDatePicker === 'compensation') {
              setCompensationDate(formattedDate);
            } else if (activeDatePicker === 'original') {
              setOriginalDate(formattedDate);
            }
            setActiveDatePicker(null);
          }}
          onClose={() => setActiveDatePicker(null)}
        />
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
    maxHeight: height * 0.88,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
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
});
