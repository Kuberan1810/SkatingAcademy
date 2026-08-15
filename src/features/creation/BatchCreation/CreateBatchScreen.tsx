import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { ImportSquare, InfoCircle } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

import { BatchFormData, CreateBatchScreenProps } from './types';
import StepProgressBar from './components/StepProgressBar';
import StepBatchInformation from './components/StepBatchInformation';
import StepScheduleFees from './components/StepScheduleFees';
import SuccessBatchModal from './components/SuccessBatchModal';
import TrainingDaysPickerModal from './components/TrainingDaysPickerModal';
import OptionPickerModal from '../studentCreation/components/OptionPickerModal';
import styles from '@/styles/styles';
import { useCreateBatch, useUpdateBatch, useBatchDetail } from '@/hooks/use-batches';
import { CreateBatchRequest } from '@/types/batch';
import { getErrorMessage } from '@/utils/error';

const DEFAULT_LEVEL_OPTIONS = ['Basic', 'Intermediate', 'Advanced', 'Professional'];
const DEFAULT_CLASS_TYPE_OPTIONS = ['Weekend', 'Weekday', 'Daily', 'Custom'];

const DAY_MAP: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Sunday: 'Sunday',
};

const REVERSE_DAY_MAP: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
  Mon: 'Mon',
  Tue: 'Tue',
  Wed: 'Wed',
  Thu: 'Thu',
  Fri: 'Fri',
  Sat: 'Sat',
  Sun: 'Sun',
};

const mapToFullDayName = (day: string): string => {
  const cleanDay = day.trim();
  return DAY_MAP[cleanDay] || cleanDay;
};

// Helper to parse time string like "06:00 AM" to Date
const parseTimeString = (timeStr: string): Date => {
  const date = new Date();
  if (!timeStr) return date;

  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return date;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Helper to format Date to "hh:mm A" (e.g. "06:00 AM")
const formatTimeString = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${formattedHours}:${formattedMinutes} ${period}`;
};

// Helper to convert time string like "06:00:00" or ISO to "06:00 AM"
const format24HourTo12Hour = (timeStr: string): string => {
  if (!timeStr) return '06:00 AM';

  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr;
  }

  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const formattedH = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedM = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${formattedH}:${formattedM} ${period}`;
  }

  const date = new Date(timeStr);
  if (!isNaN(date.getTime())) {
    return formatTimeString(date);
  }

  return timeStr;
};

// Helper to convert time string like "06:00 AM" to 24-hour format "06:00:00"
const formatTimeTo24Hour = (timeStr: string): string => {
  if (!timeStr) return '06:00:00';
  const date = parseTimeString(timeStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// Helper to parse currency string into number
const parseNumericFee = (feeStr: string | number): number => {
  if (typeof feeStr === 'number') return feeStr;
  if (!feeStr) return 0;
  const cleaned = String(feeStr).replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
};

export default function CreateBatchScreen({
  batchId,
  initialValues,
  mode = 'create',
  headerTitle,
  submitButtonText,
  onBackPress,
  onSubmit,
  onReset,
  availableLevels = DEFAULT_LEVEL_OPTIONS,
  availableClassTypes = DEFAULT_CLASS_TYPE_OPTIONS,
}: CreateBatchScreenProps) {
  const { hideTabBar, showTabBar } = useTabBarVisibility();
  const createBatchMutation = useCreateBatch();
  const updateBatchMutation = useUpdateBatch();

  const isEditing = mode === 'edit' && !!batchId;
  const numericBatchId = Number(batchId);
  const batchDetailQuery = useBatchDetail(
    numericBatchId,
    isEditing && !isNaN(numericBatchId)
  );

  const isPending = createBatchMutation.isPending || updateBatchMutation.isPending;

  useEffect(() => {
    hideTabBar();
    return () => {
      if (mode !== 'edit') {
        showTabBar();
      }
    };
  }, [hideTabBar, showTabBar, mode]);

  // Current Step: 1 | 2
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Form State
  const initialClassType = initialValues?.classType || 'Weekend';
  const initialTrainingDays =
    initialValues?.trainingDays ||
    (initialClassType === 'Weekend'
      ? 'Sat, Sun'
      : initialClassType === 'Weekday'
      ? 'Mon, Tue, Wed, Thu, Fri'
      : initialClassType === 'Daily'
      ? 'Mon, Tue, Wed, Thu, Fri, Sat, Sun'
      : 'Mon, Wed, Fri');

  const [formData, setFormData] = useState<BatchFormData>({
    batchName: initialValues?.batchName || '',
    level: initialValues?.level || '',
    location: initialValues?.location || '',
    description: initialValues?.description || '',

    classType: initialClassType,
    trainingDays: initialTrainingDays,
    startTime: initialValues?.startTime || '06:00 AM',
    endTime: initialValues?.endTime || '07:30 AM',
    monthlyFee: initialValues?.monthlyFee || '',
    yearlyFee: initialValues?.yearlyFee || '',
  });

  // Automatically prefill form when batch detail API responds
  useEffect(() => {
    if (isEditing && batchDetailQuery.data) {
      const b = batchDetailQuery.data;
      const formattedDays = b.training_days
        ? b.training_days.map((d) => REVERSE_DAY_MAP[d] || d).join(', ')
        : 'Sat, Sun';

      setFormData({
        batchName: b.batch_name || '',
        level: b.level || '',
        location: b.location || '',
        description: b.description || '',
        classType: b.class_type || 'Weekend',
        trainingDays: formattedDays,
        startTime: format24HourTo12Hour(b.start_time),
        endTime: format24HourTo12Hour(b.end_time),
        monthlyFee: b.monthly_fee ? String(b.monthly_fee) : '',
        yearlyFee: b.yearly_fee ? String(b.yearly_fee) : '',
      });
    }
  }, [isEditing, batchDetailQuery.data]);

  // Modal Dropdown State
  const [activePicker, setActivePicker] = useState<
    'level' | 'classType' | 'trainingDays' | 'startTime' | 'endTime' | null
  >(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const updateField = (key: keyof BatchFormData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (apiError) setApiError(null);
  };

  const handleSelectClassType = (val: string) => {
    let days = formData.trainingDays;
    if (val === 'Weekend') {
      days = 'Sat, Sun';
    } else if (val === 'Weekday') {
      days = 'Mon, Tue, Wed, Thu, Fri';
    } else if (val === 'Daily') {
      days = 'Mon, Tue, Wed, Thu, Fri, Sat, Sun';
    } else if (val === 'Custom') {
      if (!days) days = 'Mon, Wed, Fri';
    }

    setFormData((prev) => ({
      ...prev,
      classType: val,
      trainingDays: days,
    }));
    setActivePicker(null);

    if (val === 'Custom') {
      setTimeout(() => {
        setActivePicker('trainingDays');
      }, 250);
    }
  };

  const handleSelectTrainingDays = (daysString: string) => {
    const days = daysString.split(',').map((s) => s.trim()).filter(Boolean);
    let matchedType = 'Custom';

    if (days.length === 7) {
      matchedType = 'Daily';
    } else if (days.length === 2 && days.includes('Sat') && days.includes('Sun')) {
      matchedType = 'Weekend';
    } else if (
      days.length === 5 &&
      !days.includes('Sat') &&
      !days.includes('Sun') &&
      days.includes('Mon') &&
      days.includes('Tue') &&
      days.includes('Wed') &&
      days.includes('Thu') &&
      days.includes('Fri')
    ) {
      matchedType = 'Weekday';
    }

    setFormData((prev) => ({
      ...prev,
      trainingDays: daysString,
      classType: matchedType,
    }));
    setActivePicker(null);
  };

  const handleOpenPicker = (
    type: 'level' | 'classType' | 'trainingDays' | 'startTime' | 'endTime'
  ) => {
    if (type === 'startTime' || type === 'endTime') {
      const currentTime = parseTimeString(formData[type]);
      if (Platform.OS === 'android' && DateTimePickerAndroid?.open) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}

        DateTimePickerAndroid.open({
          value: currentTime,
          onValueChange: (_: any, selectedDate?: Date) => {
            if (selectedDate) {
              const formatted = formatTimeString(selectedDate);
              updateField(type, formatted);
            }
          },
          onDismiss: () => {},
          mode: 'time',
          is24Hour: false,
        });
        return;
      }
    }
    setActivePicker(type);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Hardware Back Handler for Android & Gesture Navigation
  useEffect(() => {
    const onHardwareBack = () => {
      if (isSuccessModalVisible) {
        setIsSuccessModalVisible(false);
        return true;
      }
      if (activePicker) {
        setActivePicker(null);
        return true;
      }
      if (currentStep === 2) {
        setCurrentStep(1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return true;
      }
      if (currentStep === 1) {
        if (onBackPress) {
          onBackPress();
          return true;
        } else if (router.canGoBack()) {
          router.back();
          return true;
        }
      }
      return false;
    };

    const backSub = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBack
    );

    return () => {
      backSub.remove();
    };
  }, [currentStep, activePicker, isSuccessModalVisible, onBackPress]);

  const handleFocusBottomField = () => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  };

  // Step Navigation & API Submission
  const handleNext = async () => {
    setApiError(null);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    if (currentStep === 1) {
      if (!formData.batchName.trim()) {
        setApiError('Please enter a batch name');
        return;
      }
      if (!formData.level.trim()) {
        setApiError('Please select a level');
        return;
      }
      if (!formData.location.trim()) {
        setApiError('Please enter a location');
        return;
      }
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Step 2 Mandatory Field Validation
      if (!formData.classType.trim()) {
        setApiError('Please select a class type');
        return;
      }
      if (!formData.trainingDays.trim()) {
        setApiError('Please select training days');
        return;
      }
      if (!formData.startTime.trim()) {
        setApiError('Please select a start time');
        return;
      }
      if (!formData.endTime.trim()) {
        setApiError('Please select an end time');
        return;
      }
      if (!formData.monthlyFee.trim()) {
        setApiError('Please enter a monthly fee');
        return;
      }
      if (!formData.yearlyFee.trim()) {
        setApiError('Please enter a yearly fee');
        return;
      }

      const rawDays = formData.trainingDays
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const mappedDays = rawDays.map(mapToFullDayName);

      const payload: CreateBatchRequest = {
        batch_name: formData.batchName.trim(),
        level: formData.level.trim(),
        location: formData.location.trim(),
        description: formData.description?.trim() || `${formData.level} skating training program`,
        class_type: formData.classType,
        training_days: mappedDays,
        start_time: formatTimeTo24Hour(formData.startTime),
        end_time: formatTimeTo24Hour(formData.endTime),
        monthly_fee: parseNumericFee(formData.monthlyFee),
        yearly_fee: parseNumericFee(formData.yearlyFee),
      };

      if (mode === 'edit') {
        const targetId = batchId || 1;
        updateBatchMutation.mutate(
          { id: targetId, payload },
          {
            onSuccess: () => {
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (e) {}
              onSubmit?.(formData);
              if (onBackPress) {
                onBackPress();
              } else if (router.canGoBack()) {
                router.back();
              }
            },
            onError: (err) => {
              const msg = getErrorMessage(err, 'Failed to update batch');
              setApiError(msg);
            },
          }
        );
      } else {
        createBatchMutation.mutate(payload, {
          onSuccess: () => {
            // Keep success modal open for user interaction
            setIsSuccessModalVisible(true);
          },
          onError: (err) => {
            const msg = getErrorMessage(err, 'Failed to create batch');
            setApiError(msg);
          },
        });
      }
    }
  };

  const handleHeaderBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (isSuccessModalVisible) {
      setIsSuccessModalVisible(false);
      return;
    }

    if (activePicker) {
      setActivePicker(null);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      if (onBackPress) {
        onBackPress();
      } else if (router.canGoBack()) {
        router.back();
      }
    }
  };

  const handleResetForm = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    setFormData({
      batchName: '',
      level: '',
      location: '',
      description: '',
      classType: 'Weekend',
      trainingDays: 'Sat, Sun',
      startTime: '06:00 AM',
      endTime: '07:30 AM',
      monthlyFee: '',
      yearlyFee: '',
    });
    setApiError(null);
    setCurrentStep(1);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    onReset?.();
  };

  const handleCreateAnother = () => {
    setIsSuccessModalVisible(false);
    handleResetForm();
  };

  const handleViewBatches = () => {
    setIsSuccessModalVisible(false);
    onSubmit?.(formData);
    if (onBackPress) {
      onBackPress();
    } else {
      router.push('/(tabs)/batches' as any);
    }
  };

  // Step Title & Label Mapping
  const getStepHeader = () => {
    switch (currentStep) {
      case 1:
        return { title: 'Batch Information', stepText: 'Step 1/2' };
      case 2:
        return { title: 'Schedule & Fees', stepText: 'Step 2/2' };
    }
  };

  const { title: stepTitle, stepText } = getStepHeader();
  const errorMessage =
    apiError ||
    (createBatchMutation.isError ? getErrorMessage(createBatchMutation.error) : null) ||
    (updateBatchMutation.isError ? getErrorMessage(updateBatchMutation.error) : null);

  const isFetchingDetail = isEditing && batchDetailQuery.isLoading;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenWrapper>
        {/* TOP APP HEADER USING HEADER.TSX */}
        <Header
          variant="page"
          title={headerTitle || (mode === 'edit' ? 'Edit Batch' : 'Create Batch')}
          showBack={true}
          onBackPress={handleHeaderBack}
          rightIcon={ImportSquare}
          onRightPress={handleResetForm}
        />

        {isFetchingDetail ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#4186F7" />
            <Text className="text-[14px] font-urbanist-medium text-secondary mt-3">
              Loading batch details...
            </Text>
          </View>
        ) : (
          <>
            <Animated.ScrollView
              ref={scrollViewRef}
              className="flex-1"
              showsVerticalScrollIndicator={false}
              decelerationRate="normal"
              bounces={true}
              alwaysBounceVertical={true}
              overScrollMode="always"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 30,
              }}
            >
              {/* STEP PROGRESS INDICATOR (2 BAR SEGMENTS) */}
              <StepProgressBar currentStep={currentStep} totalSteps={2} />

              {/* STEP SUB-HEADER */}
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-[18px] font-urbanist-bold text-primary">
                  {stepTitle}
                </Text>
                <Text className="text-[14px] font-urbanist-medium text-secondary">
                  {stepText}
                </Text>
              </View>

              {/* ERROR BANNER */}
              {errorMessage ? (
                <View className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-3.5 flex-row items-center gap-2.5">
                  <InfoCircle size={20} color="#DC2626" />
                  <Text className="text-red-700 text-[14px] flex-1 font-urbanist-medium">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* STEP 1: BATCH INFORMATION */}
              {currentStep === 1 && (
                <StepBatchInformation
                  formData={formData}
                  updateField={updateField}
                  onOpenPicker={handleOpenPicker}
                  onFocusBottomField={handleFocusBottomField}
                />
              )}

              {/* STEP 2: SCHEDULE & FEES */}
              {currentStep === 2 && (
                <StepScheduleFees
                  formData={formData}
                  updateField={updateField}
                  onOpenPicker={handleOpenPicker}
                  onFocusBottomField={handleFocusBottomField}
                />
              )}
            </Animated.ScrollView>

            {/* BOTTOM FIXED SUBMIT / NEXT ACTION BUTTON */}
            <View className="px-5 pb-8 pt-2">
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleNext}
                disabled={isPending}
                style={[styles.InnerShadowStyle, { opacity: isPending ? 0.7 : 1 }]}
                className="h-[52px] bg-[#4186F7] rounded-[14px] items-center justify-center flex-row gap-2"
              >
                {isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white text-[16px] font-urbanist-bold">
                    {submitButtonText || (currentStep === 2 ? (mode === 'edit' ? 'Save Changes' : 'Create Batch') : 'Next')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* BOTTOM MODAL PICKERS */}
        {/* Level Dropdown Modal */}
        <OptionPickerModal
          visible={activePicker === 'level'}
          title="Select Level"
          options={availableLevels}
          selectedValue={formData.level}
          onSelect={(val) => {
            updateField('level', val);
            setActivePicker(null);
          }}
          onClose={() => setActivePicker(null)}
        />

        {/* Class Type Dropdown Modal */}
        <OptionPickerModal
          visible={activePicker === 'classType'}
          title="Select Class Type"
          options={availableClassTypes}
          selectedValue={formData.classType}
          onSelect={handleSelectClassType}
          onClose={() => setActivePicker(null)}
        />

        {/* Training Days Multi-Day Selector Modal */}
        <TrainingDaysPickerModal
          visible={activePicker === 'trainingDays'}
          selectedDaysString={formData.trainingDays || 'Mon, Wed, Fri'}
          onSelect={handleSelectTrainingDays}
          onClose={() => setActivePicker(null)}
        />

        {/* iOS Native Time Picker */}
        {Platform.OS === 'ios' && (activePicker === 'startTime' || activePicker === 'endTime') && (
          <DateTimePicker
            value={parseTimeString(formData[activePicker])}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={(_: any, selectedDate?: Date) => {
              if (selectedDate && activePicker) {
                updateField(activePicker, formatTimeString(selectedDate));
              }
            }}
          />
        )}

        {/* SUCCESS CREATION BOTTOM SHEET MODAL */}
        <SuccessBatchModal
          visible={isSuccessModalVisible}
          batchName={formData.batchName || 'Morning Beginners'}
          location={formData.location || 'Sathya Stadium'}
          batchTime={`${formData.startTime || '06:00 AM'} – ${formData.endTime || '07:30 AM'}`}
          onCreateAnother={handleCreateAnother}
          onViewBatches={handleViewBatches}
          onClose={() => setIsSuccessModalVisible(false)}
        />
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}
