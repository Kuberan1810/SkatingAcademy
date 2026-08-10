import React, { useState, useEffect } from 'react';
import { View, Linking, Alert, BackHandler } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Trash } from 'iconsax-react-native';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

import {
  StudentProfileData,
  StudentProfileScreenProps,
  StudentProfileTabType,
} from './types';
import StudentSummaryCard from './components/StudentSummaryCard';
import StudentActionButtons from './components/StudentActionButtons';
import StudentSegmentedTabs from './components/StudentSegmentedTabs';
import OverviewTab from './components/tabs/OverviewTab';
import AttendanceTab from './components/tabs/AttendanceTab';
import PaymentsTab from './components/tabs/PaymentsTab';

const DEFAULT_STUDENT_PROFILE: StudentProfileData = {
  id: '1',
  name: 'Rahul Sharma',
  joinedDate: '10 Jul 2026',
  location: 'Sathya Stadium',
  attendancePercent: '92%',
  parentInfo: {
    parentName: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    emergency: '+91 98765 43211',
  },
  personalInfo: {
    gender: 'Male',
    dob: '2012-05-14',
    bloodGroup: 'B+',
    address: '12 MG Road, Bengaluru 560001',
  },
  feeInfo: {
    monthlyFee: '₹2,400',
    pending: '₹0',
    status: 'PAID',
  },
  attendanceStats: {
    present: 86,
    absent: 4,
    attendancePercent: '92%',
    scheduledDaysCount: 12,
  },
  attendanceGrid: [
    { dayName: 'Sun', dayNumber: '28', fullDate: '2025-12-28', status: 'none' },
    { dayName: 'Mon', dayNumber: '29', fullDate: '2025-12-29', status: 'present' },
    { dayName: 'Tue', dayNumber: '30', fullDate: '2025-12-30', status: 'present' },
    { dayName: 'Wed', dayNumber: '31', fullDate: '2025-12-31', status: 'present' },
    { dayName: 'Thu', dayNumber: '01', fullDate: '2026-01-01', status: 'present' },
    { dayName: 'Fri', dayNumber: '02', fullDate: '2026-01-02', status: 'present' },
    { dayName: 'Sat', dayNumber: '03', fullDate: '2026-01-03', status: 'present' },

    { dayName: 'Sun', dayNumber: '03', fullDate: '2026-01-04', status: 'none' },
    { dayName: 'Mon', dayNumber: '04', fullDate: '2026-01-05', status: 'present' },
    { dayName: 'Tue', dayNumber: '05', fullDate: '2026-01-06', status: 'present' },
    { dayName: 'Wed', dayNumber: '06', fullDate: '2026-01-07', status: 'present' },
    { dayName: 'Thu', dayNumber: '07', fullDate: '2026-01-08', status: 'present' },
    { dayName: 'Fri', dayNumber: '08', fullDate: '2026-01-09', status: 'present' },
    { dayName: 'Sat', dayNumber: '09', fullDate: '2026-01-10', status: 'present' },

    { dayName: 'Sun', dayNumber: '10', fullDate: '2026-01-11', status: 'none' },
    { dayName: 'Mon', dayNumber: '11', fullDate: '2026-01-12', status: 'present' },
    { dayName: 'Tue', dayNumber: '12', fullDate: '2026-01-13', status: 'present' },
    { dayName: 'Wed', dayNumber: '13', fullDate: '2026-01-14', status: 'present' },
    { dayName: 'Thu', dayNumber: '14', fullDate: '2026-01-15', status: 'absent' },
    { dayName: 'Fri', dayNumber: '15', fullDate: '2026-01-16', status: 'current' },
    { dayName: 'Sat', dayNumber: '16', fullDate: '2026-01-17', status: 'none' },

    { dayName: 'Sun', dayNumber: '17', fullDate: '2026-01-18', status: 'none' },
    { dayName: 'Mon', dayNumber: '18', fullDate: '2026-01-19', status: 'absent' },
    { dayName: 'Tue', dayNumber: '19', fullDate: '2026-01-20', status: 'none' },
    { dayName: 'Wed', dayNumber: '20', fullDate: '2026-01-21', status: 'none' },
    { dayName: 'Thu', dayNumber: '21', fullDate: '2026-01-22', status: 'none' },
    { dayName: 'Fri', dayNumber: '22', fullDate: '2026-01-23', status: 'none' },
    { dayName: 'Sat', dayNumber: '23', fullDate: '2026-01-24', status: 'none' },
  ],
  balanceSummary: {
    lastPaidAmount: '₹1,250',
    lastPaidDate: 'Paid on 12 Jul 2026',
    nextPaymentAmount: '₹1,250',
    nextPaymentDueDate: '05 Aug 2026',
    daysLeftText: '12 Days Left',
  },
  currentMonthFee: {
    monthYear: 'AUGUST 2026',
    amount: '₹1,250',
    status: 'paid', // Can be 'paid' | 'pending' | 'overdue'
    statusSubtext: 'Paid on 05 Aug',
    paymentDetails: 'Paid by: GPay / Cash',
  },
  transactions: [
    {
      id: 'tx-1',
      title: 'August Fee',
      dateAndMethod: '12 Aug 2026 • UPI',
      amount: '₹1,250',
      status: 'PAID',
    },
    {
      id: 'tx-2',
      title: 'July Fee',
      dateAndMethod: '19 Jul 2026 • Cash',
      amount: '₹1,250',
      status: 'PAID',
    },
    {
      id: 'tx-3',
      title: 'June Fee',
      dateAndMethod: '19 Jun 2026 • UPI',
      amount: '₹1,250',
      status: 'PAID',
    },
    {
      id: 'tx-4',
      title: 'May Fee',
      dateAndMethod: '19 May 2026 • CASH',
      amount: '₹1,250',
      status: 'PAID',
    },
  ],
};

import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';

export default function StudentProfileScreen({
  student = DEFAULT_STUDENT_PROFILE,
  studentId,
  shouldRestoreTabBarOnUnmount = true,
  onBackPress,
  onDeletePress,
  onCallPress,
  onCollectPress,
  onEditPress,
  onStudentUpdate,
}: StudentProfileScreenProps) {
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();
  const [activeTab, setActiveTab] = useState<StudentProfileTabType>('overview');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentProfileData>({
    ...DEFAULT_STUDENT_PROFILE,
    ...student,
    parentInfo: { ...DEFAULT_STUDENT_PROFILE.parentInfo, ...(student.parentInfo || {}) },
    personalInfo: { ...DEFAULT_STUDENT_PROFILE.personalInfo, ...(student.personalInfo || {}) },
    feeInfo: { ...DEFAULT_STUDENT_PROFILE.feeInfo, ...(student.feeInfo || {}) },
    attendanceStats: { ...DEFAULT_STUDENT_PROFILE.attendanceStats, ...(student.attendanceStats || {}) },
    attendanceGrid: student.attendanceGrid || DEFAULT_STUDENT_PROFILE.attendanceGrid,
    payments: student.payments || DEFAULT_STUDENT_PROFILE.payments,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrentStudent({
      ...DEFAULT_STUDENT_PROFILE,
      ...student,
      parentInfo: { ...DEFAULT_STUDENT_PROFILE.parentInfo, ...(student.parentInfo || {}) },
      personalInfo: { ...DEFAULT_STUDENT_PROFILE.personalInfo, ...(student.personalInfo || {}) },
      feeInfo: { ...DEFAULT_STUDENT_PROFILE.feeInfo, ...(student.feeInfo || {}) },
      attendanceStats: { ...DEFAULT_STUDENT_PROFILE.attendanceStats, ...(student.attendanceStats || {}) },
      attendanceGrid: student.attendanceGrid || DEFAULT_STUDENT_PROFILE.attendanceGrid,
      payments: student.payments || DEFAULT_STUDENT_PROFILE.payments,
    });
  }, [
    student.id,
    student.name,
    student.joinedDate,
    student.location,
    student.attendancePercent,
    student.avatar,
    student.parentInfo?.parentName,
    student.parentInfo?.phone,
    student.parentInfo?.emergency,
    student.personalInfo?.gender,
    student.personalInfo?.dob,
    student.personalInfo?.bloodGroup,
    student.feeInfo?.monthlyFee,
  ]);

  // Hide floating tab bar when inside the dedicated student profile
  useEffect(() => {
    hideTabBar();
    return () => {
      if (shouldRestoreTabBarOnUnmount) {
        showTabBar();
      }
    };
  }, [hideTabBar, showTabBar, shouldRestoreTabBarOnUnmount]);

  // Handle Android hardware back press
  useEffect(() => {
    const backAction = () => {
      if (isEditing) {
        setIsEditing(false);
        return true;
      }
      if (isDeleteModalVisible) {
        setIsDeleteModalVisible(false);
        return true;
      }
      if (onBackPress) {
        onBackPress();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isEditing, isDeleteModalVisible, onBackPress]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      try {
        if (router.canGoBack()) {
          router.back();
        }
      } catch (e) {
        console.log('Navigation back error:', e);
      }
    }
  };

  const handleCall = () => {
    const phoneNumber = currentStudent?.parentInfo?.phone || (currentStudent as any)?.phone || '+919876543210';
    if (onCallPress) {
      onCallPress(phoneNumber);
    } else {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleCollect = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    if (onCollectPress) {
      onCollectPress();
    } else {
      const studentForCollect = {
        id: currentStudent.id,
        name: currentStudent.name,
        studentId: `ID: SA-2024-${(currentStudent.id || '1').toString().padStart(4, '0')}`,
        location: currentStudent.location || 'Sathya Stadium',
        dueAmount: currentStudent.currentMonthFee?.amount || currentStudent.feeInfo?.monthlyFee || '₹1,200',
        dueLabel: 'Due Today',
        avatar: currentStudent.avatar,
      };

      router.push({
        pathname: '/(tabs)/fees/CollectFee' as any,
        params: {
          studentData: JSON.stringify(studentForCollect),
        },
      });
    }
  };

  const handleEdit = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (onEditPress) {
      onEditPress();
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (onDeletePress) {
      onDeletePress();
    } else {
      handleBack();
    }
  };

  if (isEditing) {
    return (
      <AddStudentScreen
        mode="edit"
        initialValues={{
          avatarUri: typeof currentStudent.avatar === 'string' ? currentStudent.avatar : null,
          fullName: currentStudent.name,
          gender: currentStudent.personalInfo.gender || 'Male',
          dob: currentStudent.personalInfo.dob || '',
          bloodGroup: currentStudent.personalInfo.bloodGroup || 'O+',
          batch: currentStudent.location || 'Morning Beginners',
          joinDate: currentStudent.joinedDate || '',
          parentName: currentStudent.parentInfo.parentName || '',
          phoneNumber: currentStudent.parentInfo.phone || '+91 ',
          emergencyContact: currentStudent.parentInfo.emergency || '+91 ',
          monthlyFee: currentStudent.feeInfo.monthlyFee || '₹1,250',
        }}
        onBackPress={() => setIsEditing(false)}
        onSubmit={(updatedData) => {
          const updatedStudent: StudentProfileData = {
            ...currentStudent,
            name: updatedData.fullName || currentStudent.name,
            joinedDate: updatedData.joinDate || currentStudent.joinedDate,
            location: updatedData.batch || currentStudent.location,
            personalInfo: {
              ...currentStudent.personalInfo,
              gender: updatedData.gender || currentStudent.personalInfo.gender,
              dob: updatedData.dob || currentStudent.personalInfo.dob,
              bloodGroup: updatedData.bloodGroup || currentStudent.personalInfo.bloodGroup,
            },
            parentInfo: {
              ...currentStudent.parentInfo,
              parentName: updatedData.parentName || currentStudent.parentInfo.parentName,
              phone: updatedData.phoneNumber || currentStudent.parentInfo.phone,
              emergency: updatedData.emergencyContact || currentStudent.parentInfo.emergency,
            },
            feeInfo: {
              ...currentStudent.feeInfo,
              monthlyFee: updatedData.monthlyFee || currentStudent.feeInfo.monthlyFee,
            },
          };
          setCurrentStudent(updatedStudent);
          onStudentUpdate?.(updatedStudent);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <ScreenWrapper>
      {/* Top Header */}
      <Header
        variant="page"
        title="Student Profile"
        showBack={true}
        onBackPress={handleBack}
        rightIcon={<Trash size={20} color="#EF4444" variant="Linear" />}
        onRightPress={handleDelete}
      />

      {/* Main Content Area */}
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
          paddingBottom: 40,
        }}
      >
        {/* Student Summary Top Card */}
        <StudentSummaryCard
          name={currentStudent.name}
          joinedDate={currentStudent.joinedDate}
          location={currentStudent.location}
          attendancePercent={currentStudent.attendancePercent}
          avatar={currentStudent.avatar}
        />

        {/* Action Buttons: [Call] [Collect] [Edit] */}
        <StudentActionButtons
          onCallPress={handleCall}
          onCollectPress={handleCollect}
          onEditPress={handleEdit}
        />

        {/* Segmented Tab Switcher: [Overview] [Attendance] [Payments] */}
        <StudentSegmentedTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <OverviewTab
            parentInfo={currentStudent.parentInfo}
            personalInfo={currentStudent.personalInfo}
            feeInfo={currentStudent.feeInfo}
          />
        )}

        {/* Tab 2: Attendance */}
        {activeTab === 'attendance' && (
          <AttendanceTab
            stats={currentStudent.attendanceStats}
            attendanceGrid={currentStudent.attendanceGrid}
          />
        )}

        {/* Tab 3: Payments */}
        {activeTab === 'payments' && (
          <PaymentsTab
            balanceSummary={currentStudent.balanceSummary}
            currentMonthFee={currentStudent.currentMonthFee}
            transactions={currentStudent.transactions}
          />
        )}
      </Animated.ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        itemName={currentStudent.name}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </ScreenWrapper>
  );
}
