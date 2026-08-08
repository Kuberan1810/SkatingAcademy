import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { ImportSquare } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

import { StudentFormData, AddStudentScreenProps } from './types';
import OptionPickerModal from './components/OptionPickerModal';
import StepProgressBar from './components/StepProgressBar';
import AvatarPicker from './components/AvatarPicker';
import StepBasicInfo from './components/StepBasicInfo';
import StepBatchInfo from './components/StepBatchInfo';
import StepParentPayment from './components/StepParentPayment';

const DEFAULT_BATCHES = [
  'Morning Speed Skating A',
  'Evening Regular B',
  'Weekend Advanced C',
  'Beginner Basic D',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const BLOOD_GROUP_OPTIONS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

export default function AddStudentScreen({
  initialValues,
  onBackPress,
  onSubmit,
  onReset,
  onPickAvatar,
  availableBatches = DEFAULT_BATCHES,
}: AddStudentScreenProps) {
  // Hide bottom tab bar / navbar while on this page & get smooth scroll handler
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  // Current Step: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState<StudentFormData>({
    avatarUri: initialValues?.avatarUri || null,
    fullName: initialValues?.fullName || '',
    age: initialValues?.age || '',
    gender: initialValues?.gender || 'Male',
    dob: initialValues?.dob || '',
    bloodGroup: initialValues?.bloodGroup || 'O+',

    batch: initialValues?.batch || '',
    joinDate: initialValues?.joinDate || '',

    parentName: initialValues?.parentName || '',
    phoneNumber: initialValues?.phoneNumber || '+91 ',
    emergencyContact: initialValues?.emergencyContact || '+91 ',
    monthlyFee: initialValues?.monthlyFee || '₹1,250',
  });

  // Modal Dropdown State
  const [activePicker, setActivePicker] = useState<
    'gender' | 'bloodGroup' | 'batch' | null
  >(null);

  const updateField = (key: keyof StudentFormData, val: string | null) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  // Avatar Picker Handler
  const handlePickAvatar = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (onPickAvatar) {
      onPickAvatar();
    } else {
      const demoAvatar =
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300';
      updateField(
        'avatarUri',
        formData.avatarUri === demoAvatar ? null : demoAvatar
      );
    }
  };

  // Step Navigation Handlers
  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      // Final Step Submission
      onSubmit?.(formData);
    }
  };

  const handleHeaderBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    } else {
      onBackPress?.();
    }
  };

  const handleResetForm = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    setFormData({
      avatarUri: null,
      fullName: '',
      age: '',
      gender: 'Male',
      dob: '',
      bloodGroup: 'O+',
      batch: '',
      joinDate: '',
      parentName: '',
      phoneNumber: '+91 ',
      emergencyContact: '+91 ',
      monthlyFee: '₹1,250',
    });
    setCurrentStep(1);
    onReset?.();
  };

  // Step Title & Label Mapping
  const getStepHeader = () => {
    switch (currentStep) {
      case 1:
        return { title: 'Basic Information', stepText: 'Step 1/3' };
      case 2:
        return { title: 'Batch Information', stepText: 'Step 2/3' };
      case 3:
        return { title: 'Parent & Payment', stepText: 'Step 3/3' };
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
          title="Add Student"
          showBack={true}
          onBackPress={handleHeaderBack}
          rightIcon={ImportSquare}
          onRightPress={handleResetForm}
        />

        <Animated.ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          bounces={true}
          alwaysBounceVertical={true}
          overScrollMode="always"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingBottom: 140,
          }}
        >
          {/* TOP PROFILE AVATAR PICKER WITH IMAGE UPLOAD */}
          <AvatarPicker
            avatarUri={formData.avatarUri}
            onImageSelected={(uri) => updateField('avatarUri', uri)}
          />

          {/* STEP PROGRESS INDICATOR (3 BAR SEGMENTS) */}
          <StepProgressBar currentStep={currentStep} totalSteps={3} />

          {/* STEP SUB-HEADER */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[16px] font-urbanist-bold text-[#111827]">
              {stepTitle}
            </Text>
            <Text className="text-[14px] font-urbanist-semibold text-[#6B7280]">
              {stepText}
            </Text>
          </View>

          {/* STEP CONTENT COMPONENTS */}
          {currentStep === 1 && (
            <StepBasicInfo
              formData={formData}
              updateField={updateField}
              onOpenGenderPicker={() => setActivePicker('gender')}
              onOpenBloodGroupPicker={() => setActivePicker('bloodGroup')}
            />
          )}

          {currentStep === 2 && (
            <StepBatchInfo
              formData={formData}
              updateField={updateField}
              onOpenBatchPicker={() => setActivePicker('batch')}
            />
          )}

          {currentStep === 3 && (
            <StepParentPayment
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* BOTTOM SUBMIT / NEXT ACTION BUTTON */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNext}
            className="h-[52px] bg-[#4E75F8] rounded-[16px] items-center justify-center shadow-lg shadow-[#4E75F8]/25 mt-2"
          >
            <Text className="text-white text-[16px] font-urbanist-bold">
              {currentStep === 3 ? 'Add Student' : 'Next'}
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>

        {/* MODAL PICKERS */}
        <OptionPickerModal
          visible={activePicker === 'gender'}
          title="Select Gender"
          options={GENDER_OPTIONS}
          selectedValue={formData.gender}
          onSelect={(val) => updateField('gender', val)}
          onClose={() => setActivePicker(null)}
        />

        <OptionPickerModal
          visible={activePicker === 'bloodGroup'}
          title="Select Blood Group"
          options={BLOOD_GROUP_OPTIONS}
          selectedValue={formData.bloodGroup}
          onSelect={(val) => updateField('bloodGroup', val)}
          onClose={() => setActivePicker(null)}
        />

        <OptionPickerModal
          visible={activePicker === 'batch'}
          title="Select Batch"
          options={availableBatches}
          selectedValue={formData.batch}
          onSelect={(val) => updateField('batch', val)}
          onClose={() => setActivePicker(null)}
        />
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}
