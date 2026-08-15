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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { ImportSquare, InfoCircle } from 'iconsax-react-native';
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
import { useCreateStudent, useUpdateStudent, useStudentDetail } from '@/hooks/use-students';
import { useBatchesList } from '@/hooks/use-batches';
import { CreateStudentRequest, Student } from '@/types/student';
import { getErrorMessage } from '@/utils/error';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const BLOOD_GROUP_OPTIONS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const MONTHS_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

const formatDateToYYYYMMDD = (dateStr: string): string => {
  if (!dateStr || !dateStr.trim()) {
    return '2012-05-14';
  }

  const str = dateStr.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = str.split(/[\/\.-]/);
  if (parts.length === 3) {
    const p0 = parts[0].trim();
    const p1 = parts[1].trim();
    const p2 = parts[2].trim();

    if (p0.length === 4) {
      // YYYY-MM-DD
      return `${p0}-${p1.padStart(2, '0')}-${p2.padStart(2, '0')}`;
    }
    if (p2.length === 4) {
      // DD-MM-YYYY
      return `${p2}-${p1.padStart(2, '0')}-${p0.padStart(2, '0')}`;
    }
  }

  // Handle "14 May 2012" or "14-May-2012" or "May 14, 2012"
  const textParts = str.split(/[\s,-]+/);
  if (textParts.length >= 3) {
    let day = '';
    let month = '';
    let year = '';

    textParts.forEach((pt) => {
      const lower = pt.toLowerCase();
      if (MONTHS_MAP[lower]) {
        month = MONTHS_MAP[lower];
      } else if (/^\d{4}$/.test(pt)) {
        year = pt;
      } else if (/^\d{1,2}$/.test(pt)) {
        day = pt.padStart(2, '0');
      }
    });

    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  }

  // Native Date fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return '2012-05-14';
};

const cleanPhoneNumber = (phoneStr: string): string => {
  if (!phoneStr) return '9876543210';
  const cleaned = phoneStr.replace(/[^0-9]/g, '');
  if (cleaned.length >= 10) {
    return cleaned.slice(-10);
  }
  return cleaned || '9876543210';
};

const parseNumericFee = (feeStr: string | number): number => {
  if (typeof feeStr === 'number') return feeStr;
  if (!feeStr) return 0;
  const cleaned = String(feeStr).replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
};

export default function AddStudentScreen({
  studentId,
  initialValues,
  mode = 'create',
  headerTitle,
  submitButtonText,
  onBackPress,
  onSubmit,
  onReset,
  onPickAvatar,
  availableBatches,
}: AddStudentScreenProps) {
  const { hideTabBar, showTabBar } = useTabBarVisibility();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const batchesQuery = useBatchesList();

  const isEditing = mode === 'edit' && (!!studentId || !!initialValues?.id);
  const targetStudentId = Number(studentId || initialValues?.id);

  const studentDetailQuery = useStudentDetail(
    targetStudentId,
    isEditing && !isNaN(targetStudentId)
  );

  const isPending = createStudentMutation.isPending || updateStudentMutation.isPending;

  useEffect(() => {
    hideTabBar();
    return () => {
      if (mode !== 'edit') {
        showTabBar();
      }
    };
  }, [hideTabBar, showTabBar, mode]);

  // Derive batch options list
  const batchesList = batchesQuery.data ?? [];
  const batchNamesOptions =
    availableBatches ||
    (batchesList.length > 0
      ? batchesList.map((b) => b.batch_name)
      : [
          'Morning Speed Skating A',
          'Evening Regular B',
          'Weekend Advanced C',
          'Beginner Basic D',
        ]);

  // Current Step: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdStudentData, setCreatedStudentData] = useState<Student | null>(null);
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
    phoneNumber: initialValues?.phoneNumber || '',
    emergencyContact: initialValues?.emergencyContact || '',
    monthlyFee: initialValues?.monthlyFee || '',
  });

  // Sync initialValues or API studentDetail data when editing
  useEffect(() => {
    if (isEditing && studentDetailQuery.data) {
      const s = studentDetailQuery.data;
      setFormData({
        avatarUri: s.avatar_uri || null,
        fullName: s.full_name || '',
        age: s.age ? String(s.age) : '',
        gender: s.gender || 'Male',
        dob: s.dob || '',
        bloodGroup: s.blood_group || 'O+',
        batch: s.batch_name || '',
        joinDate: s.join_date || '',
        parentName: s.parent_name || '',
        phoneNumber: s.phone_number || '',
        emergencyContact: s.emergency_contact || '',
        monthlyFee: s.monthly_fee ? `₹${s.monthly_fee.toLocaleString('en-IN')}` : '',
      });
    } else if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [isEditing, studentDetailQuery.data, initialValues]);

  // Modal Dropdown State
  const [activePicker, setActivePicker] = useState<
    'photo' | 'gender' | 'bloodGroup' | 'batch' | 'dob' | 'joinDate' | null
  >(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const updateField = (key: keyof StudentFormData, val: string | null) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (apiError) setApiError(null);
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

  // Step Navigation & API Submission
  const handleNext = () => {
    setApiError(null);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    // STEP 1 VALIDATION (Required: Name, Gender, DOB)
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setApiError('Please enter student full name');
        return;
      }
      if (!formData.gender.trim()) {
        setApiError('Please select gender');
        return;
      }
      if (!formData.dob.trim()) {
        setApiError('Please select Date of Birth');
        return;
      }
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
    // STEP 2 VALIDATION (Required: Batch)
    else if (currentStep === 2) {
      if (!formData.batch.trim()) {
        setApiError('Please select a batch');
        return;
      }
      setCurrentStep(3);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
    // STEP 3 VALIDATION (Required: Phone Number, Monthly Fee)
    else {
      const cleanPhone = formData.phoneNumber.replace(/[^0-9]/g, '');
      if (!formData.phoneNumber.trim() || cleanPhone.length === 0) {
        setApiError('Please enter phone number');
        return;
      }
      if (!formData.monthlyFee.trim() || parseNumericFee(formData.monthlyFee) === 0) {
        setApiError('Please enter monthly fee');
        return;
      }

      // Step 3 Submission -> POST/PUT /api/v1/students
      const matchedBatch = batchesList.find(
        (b) => b.batch_name.toLowerCase() === formData.batch.toLowerCase()
      );
      const batchId = matchedBatch ? matchedBatch.id : (batchesList[0]?.id || 1);

      const phoneDigits = cleanPhoneNumber(formData.phoneNumber);
      const emergencyDigits = formData.emergencyContact.trim()
        ? cleanPhoneNumber(formData.emergencyContact)
        : phoneDigits;

      const payload: CreateStudentRequest = {
        full_name: formData.fullName.trim(),
        dob: formatDateToYYYYMMDD(formData.dob),
        gender: formData.gender || 'Male',
        blood_group: formData.bloodGroup || null,
        batch_id: Number(batchId),
        join_date: formData.joinDate
          ? formatDateToYYYYMMDD(formData.joinDate)
          : new Date().toISOString().split('T')[0],
        parent_name: formData.parentName.trim() || 'Parent',
        phone_number: phoneDigits,
        emergency_contact: emergencyDigits,
        monthly_fee: parseNumericFee(formData.monthlyFee) || 1250,
        avatar_uri: formData.avatarUri || null,
      };

      if (mode === 'edit') {
        const editId = targetStudentId || 1;
        updateStudentMutation.mutate(
          { id: editId, payload },
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
              const msg = getErrorMessage(err, 'Failed to update student');
              setApiError(msg);
            },
          }
        );
      } else {
        createStudentMutation.mutate(payload, {
          onSuccess: (created) => {
            setCreatedStudentData(created);
            setIsSuccessModalVisible(true);
          },
          onError: (err) => {
            const msg = getErrorMessage(err, 'Failed to create student');
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
      phoneNumber: '',
      emergencyContact: '',
      monthlyFee: '',
    });
    setApiError(null);
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
  const errorMessage =
    apiError ||
    (createStudentMutation.isError ? getErrorMessage(createStudentMutation.error) : null) ||
    (updateStudentMutation.isError ? getErrorMessage(updateStudentMutation.error) : null);

  const isFetchingDetail = isEditing && studentDetailQuery.isLoading;

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

        {isFetchingDetail ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#4186F7" />
            <Text className="text-[14px] font-urbanist-medium text-secondary mt-3">
              Loading student details...
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
                  onOpenJoinDatePicker={() => {}}
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
                disabled={isPending}
                style={[styles.InnerShadowStyle, { opacity: isPending ? 0.7 : 1 }]}
                className="h-[52px] bg-[#4186F7] rounded-[14px] items-center justify-center flex-row gap-2"
              >
                {isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white text-[16px] font-urbanist-bold">
                    {currentStep === 3
                      ? submitButtonText || (mode === 'edit' ? 'Save Changes' : 'Add Student')
                      : 'Next'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

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
          options={batchNamesOptions}
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
            onSubmit?.(formData);
            const targetStudentId = createdStudentData?.id || 1;
            router.push({
              pathname: '/(tabs)/students/[id]' as any,
              params: {
                id: String(targetStudentId),
                studentData: JSON.stringify({
                  id: String(targetStudentId),
                  name: createdStudentData?.full_name || formData.fullName,
                  avatar: createdStudentData?.avatar_uri || formData.avatarUri || undefined,
                  joinedDate: createdStudentData?.join_date || 'Today',
                  location: createdStudentData?.batch_name || formData.batch || 'Morning Beginners',
                  attendancePercent: '0%',
                  parentInfo: {
                    parentName: createdStudentData?.parent_name || formData.parentName || 'Parent',
                    phone: createdStudentData?.phone_number || formData.phoneNumber || '',
                    emergency: createdStudentData?.emergency_contact || formData.emergencyContact || '',
                  },
                  personalInfo: {
                    gender: createdStudentData?.gender || formData.gender || 'Male',
                    dob: createdStudentData?.dob || formData.dob || '',
                    bloodGroup: createdStudentData?.blood_group || formData.bloodGroup || 'O+',
                  },
                  feeInfo: {
                    monthlyFee: createdStudentData?.monthly_fee
                      ? `₹${createdStudentData.monthly_fee}`
                      : formData.monthlyFee || '₹1,250',
                    pending: '₹1,250',
                    status: 'PENDING',
                  },
                }),
              },
            });
          }}
          onClose={() => {
            setIsSuccessModalVisible(false);
            onSubmit?.(formData);
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
