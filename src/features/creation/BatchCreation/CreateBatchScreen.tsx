import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
  BackHandler,
} from 'react-native';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { ImportSquare } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { BatchFormData, CreateBatchScreenProps } from './types';
import StepProgressBar from './components/StepProgressBar';
import StepBatchInformation from './components/StepBatchInformation';
import StepScheduleFees from './components/StepScheduleFees';
import SuccessBatchModal from './components/SuccessBatchModal';
import TrainingDaysPickerModal from './components/TrainingDaysPickerModal';
import OptionPickerModal from '../studentCreation/components/OptionPickerModal';
import DatePickerModal from '../studentCreation/components/DatePickerModal';
import styles from '@/styles/styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_LEVEL_OPTIONS = ['Basic', 'Intermediate', 'Advanced', 'Professional'];
const DEFAULT_CLASS_TYPE_OPTIONS = ['Weekend', 'Weekday', 'Daily', 'Custom'];

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

export default function CreateBatchScreen({
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
  // Hide bottom tab bar while on this creation page
  const { hideTabBar, showTabBar } = useTabBarVisibility();

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
    level: initialValues?.level || 'Basic',
    location: initialValues?.location || 'Sathya Stadium',
    description: initialValues?.description || '',

    classType: initialClassType,
    trainingDays: initialTrainingDays,
    startTime: initialValues?.startTime || '06:00 AM',
    endTime: initialValues?.endTime || '07:30 AM',
    monthlyFee: initialValues?.monthlyFee || '₹1,250',
    yearlyFee: initialValues?.yearlyFee || '₹1,250',
  });

  // Modal Dropdown State
  const [activePicker, setActivePicker] = useState<
    'level' | 'classType' | 'trainingDays' | 'startTime' | 'endTime' | null
  >(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const updateField = (key: keyof BatchFormData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
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

    // Open days picker when 'Custom' is chosen so user can customize immediately
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
        if (onBackPress) {
          onBackPress();
        } else if (router.canGoBack()) {
          router.back();
        }
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

  // Step Navigation Handlers
  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    if (currentStep === 1) {
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Final Step Submission
      if (mode === 'edit') {
        onSubmit?.(formData);
      } else {
        setIsSuccessModalVisible(true);
        onSubmit?.(formData);
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
      level: 'Basic',
      location: 'Sathya Stadium',
      description: '',
      classType: 'Weekend',
      trainingDays: '',
      startTime: '06:00 AM',
      endTime: '07:30 AM',
      monthlyFee: '₹1,250',
      yearlyFee: '₹1,250',
    });
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
          <View className="flex-row items-center justify-between mb-7">
            <Text className="text-[18px] font-urbanist-bold text-primary">
              {stepTitle}
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary">
              {stepText}
            </Text>
          </View>

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
            style={[styles.InnerShadowStyle]}
            className="h-[52px] bg-[#4186F7] rounded-[14px] items-center justify-center"
          >
            <Text className="text-white text-[16px] font-urbanist-bold">
              {submitButtonText || (currentStep === 2 ? (mode === 'edit' ? 'Save Changes' : 'Create Batch') : 'Next')}
            </Text>
          </TouchableOpacity>
        </View>

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
            onValueChange={(_: any, selectedDate?: Date) => {
              if (selectedDate && activePicker) {
                updateField(activePicker, formatTimeString(selectedDate));
              }
            }}
            onDismiss={() => {
              setActivePicker(null);
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
