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

import { StudentFormData, AddStudentScreenProps } from './types';
import OptionPickerModal from './components/OptionPickerModal';
import DatePickerModal from './components/DatePickerModal';
import PhotoPickerModal from './components/PhotoPickerModal';
import SuccessStudentModal from './components/SuccessStudentModal';
import StepProgressBar from './components/StepProgressBar';
import AvatarPicker from './components/AvatarPicker';
import StepBasicInfo from './components/StepBasicInfo';
import StepBatchInfo from './components/StepBatchInfo';
import StepParentPayment from './components/StepParentPayment';
import styles from '@/styles/styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  mode = 'create',
  headerTitle,
  submitButtonText,
  onBackPress,
  onSubmit,
  onReset,
  onPickAvatar,
  availableBatches = DEFAULT_BATCHES,
}: AddStudentScreenProps) {
  // Hide bottom tab bar / navbar while on this page
  const { hideTabBar, showTabBar } = useTabBarVisibility();

  useEffect(() => {
    hideTabBar();
    return () => {
      if (mode !== 'edit') {
        showTabBar();
      }
    };
  }, [hideTabBar, showTabBar, mode]);

  // Current Step: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

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

  // Sync initialValues when editing
  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [initialValues]);

  // Modal Dropdown State
  const [activePicker, setActivePicker] = useState<
    'photo' | 'gender' | 'bloodGroup' | 'batch' | 'dob' | 'joinDate' | null
  >(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const updateField = (key: keyof StudentFormData, val: string | null) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
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
      if (currentStep === 3) {
        setCurrentStep(2);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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

  // Avatar Picker Handler
  const handlePickAvatar = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (onPickAvatar) {
      onPickAvatar();
    } else {
      setActivePicker('photo');
    }
  };

  // Step Navigation Handlers
  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    if (currentStep === 1) {
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Final Step Submission
      if (onSubmit) {
        onSubmit(formData);
      } else if (mode === 'edit') {
        if (onBackPress) {
          onBackPress();
        } else if (router.canGoBack()) {
          router.back();
        }
      } else {
        setIsSuccessModalVisible(true);
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

    if (currentStep === 3) {
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === 2) {
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
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
          title={headerTitle || (mode === 'edit' ? 'Edit Student' : 'Add Student')}
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
            minHeight: SCREEN_HEIGHT * 0.82,
            paddingHorizontal: 20,
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 120,
          }}
        >
          {/* TOP PROFILE AVATAR PICKER WITH IMAGE UPLOAD */}
          <AvatarPicker
            avatarUri={formData.avatarUri}
            onPress={handlePickAvatar}
          />

          {/* STEP PROGRESS INDICATOR (3 BAR SEGMENTS) */}
          <StepProgressBar
            currentStep={currentStep}
            totalSteps={3}
            onStepPress={(step) => {
              setCurrentStep(step as 1 | 2 | 3);
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
          />

          {/* STEP SUB-HEADER */}
          <View className="flex-row items-center justify-between mb-7">
            <Text className="text-[18px] font-urbanist-bold text-primary">
              {stepTitle}
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary">
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
              onOpenDatePicker={() => setActivePicker('dob')}
            />
          )}

          {currentStep === 2 && (
            <StepBatchInfo
              formData={formData}
              updateField={updateField}
              onOpenBatchPicker={() => setActivePicker('batch')}
              onOpenJoinDatePicker={() => setActivePicker('joinDate')}
            />
          )}

          {currentStep === 3 && (
            <StepParentPayment
              formData={formData}
              updateField={updateField}
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
              {currentStep === 3
                ? submitButtonText || (mode === 'edit' ? 'Save Changes' : 'Add Student')
                : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODAL PICKERS (Rendered at Screen Root Level) */}
        <PhotoPickerModal
          visible={activePicker === 'photo'}
          avatarUri={formData.avatarUri}
          onImageSelected={(uri) => updateField('avatarUri', uri)}
          onClose={() => setActivePicker(null)}
        />

        <DatePickerModal
          visible={activePicker === 'dob'}
          title="Select Date of Birth"
          summaryLabel="Selected DOB"
          value={formData.dob}
          onSelect={(val) => updateField('dob', val)}
          onClose={() => setActivePicker(null)}
        />

        <DatePickerModal
          visible={activePicker === 'joinDate'}
          title="Select Join Date"
          summaryLabel="Selected Join Date"
          value={formData.joinDate}
          defaultToCurrentYear={true}
          onSelect={(val) => updateField('joinDate', val)}
          onClose={() => setActivePicker(null)}
        />

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

        {/* SUCCESS CREATION BOTTOM SHEET */}
        <SuccessStudentModal
          visible={isSuccessModalVisible}
          studentName={formData.fullName || 'Student'}
          batchName={formData.batch || 'Morning Beginners'}
          batchTime="06:00 – 07:30 AM"
          onAddAnother={() => {
            setIsSuccessModalVisible(false);
            handleResetForm();
          }}
          onViewBatch={() => {
            setIsSuccessModalVisible(false);
            if (onBackPress) {
              onBackPress();
            } else if (router.canGoBack()) {
              router.back();
            }
          }}
          onClose={() => {
            setIsSuccessModalVisible(false);
            if (onBackPress) {
              onBackPress();
            } else if (router.canGoBack()) {
              router.back();
            }
          }}
        />
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}
