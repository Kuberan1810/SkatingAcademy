import React, { useState, useEffect } from 'react';
import { View, Linking, BackHandler } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Trash } from 'iconsax-react-native';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Toast from '@/components/ui/Toast';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import { ApiStudentProfileData } from '@/types/student';
import { useStudentProfile, useDeleteStudent } from '@/hooks/use-students';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';
import { StudentProfileSkeleton } from '@/components/ui/Skeleton';

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
    address: 'Sathya Stadium, Skating Academy',
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
  attendanceGrid: [],
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
    status: 'paid',
    statusSubtext: 'Paid on 05 Aug',
    paymentDetails: 'Paid by: GPay / Cash',
  },
  transactions: [],
};

export function mapApiProfileToStudentProfile(apiData: ApiStudentProfileData): StudentProfileData {
  return {
    id: String(apiData.id),
    name: apiData.name || 'Student',
    avatar: apiData.avatar_uri || undefined,
    joinedDate: apiData.joined_date || '14 May 2012',
    location: apiData.location || 'Sathya Stadium',
    attendancePercent: apiData.attendance_percent || '0%',
    parentInfo: {
      parentName: apiData.parent_info?.parent_name || 'Parent',
      phone: apiData.parent_info?.phone || '',
      emergency: apiData.parent_info?.emergency || '',
    },
    personalInfo: {
      gender: apiData.personal_info?.gender || 'Male',
      dob: apiData.personal_info?.dob || '2012-05-14',
      bloodGroup: apiData.personal_info?.blood_group || 'O+',
      address: 'Sathya Stadium, Skating Academy',
    },
    feeInfo: {
      monthlyFee: apiData.fee_info?.monthly_fee
        ? `₹${apiData.fee_info.monthly_fee.toLocaleString('en-IN')}`
        : '₹1,250',
      pending: apiData.fee_info?.pending
        ? `₹${apiData.fee_info.pending.toLocaleString('en-IN')}`
        : '₹0',
      status: (apiData.fee_info?.status as any) || 'PAID',
    },
    attendanceStats: {
      present: apiData.attendance_stats?.present ?? 0,
      absent: apiData.attendance_stats?.absent ?? 0,
      attendancePercent: apiData.attendance_stats?.attendance_percent || '0%',
      scheduledDaysCount: apiData.attendance_stats?.scheduled_days_count ?? 0,
    },
    attendanceGrid: (apiData.attendance_grid || []).map((item) => ({
      dayName: item.day_name || '',
      dayNumber: item.day_number || '',
      fullDate: item.full_date || '',
      status: (item.status as any) || 'none',
    })),
    balanceSummary: {
      lastPaidAmount: apiData.balance_summary?.last_paid_amount
        ? `₹${apiData.balance_summary.last_paid_amount.toLocaleString('en-IN')}`
        : '₹0',
      lastPaidDate: apiData.balance_summary?.last_paid_date
        ? `Paid on ${apiData.balance_summary.last_paid_date}`
        : 'No recent payments',
      nextPaymentAmount: apiData.balance_summary?.next_payment_amount
        ? `₹${apiData.balance_summary.next_payment_amount.toLocaleString('en-IN')}`
        : '₹1,250',
      nextPaymentDueDate: apiData.balance_summary?.next_payment_due_date || '',
      daysLeftText: apiData.balance_summary?.days_left_text || '',
    },
    currentMonthFee: {
      monthYear: apiData.current_month_fee?.month_year || 'CURRENT MONTH',
      amount: apiData.current_month_fee?.amount
        ? `₹${apiData.current_month_fee.amount.toLocaleString('en-IN')}`
        : '₹1,250',
      status: (apiData.current_month_fee?.status as any) || 'pending',
      statusSubtext: apiData.current_month_fee?.status_subtext || '',
      paymentDetails: apiData.current_month_fee?.payment_details || 'Pending',
    },
    transactions: (apiData.transactions || []).map((tx) => ({
      id: String(tx.id),
      title: tx.title || 'Fee Payment',
      dateAndMethod: tx.date_and_method || '',
      amount: tx.amount ? `₹${tx.amount.toLocaleString('en-IN')}` : '₹1,250',
      status: (tx.status as any) || 'PAID',
    })),
  };
}

export default function StudentProfileScreen({
  student = DEFAULT_STUDENT_PROFILE,
  studentId,
  initialTab = 'overview',
  shouldRestoreTabBarOnUnmount = true,
  onBackPress,
  onDeletePress,
  onCallPress,
  onCollectPress,
  onEditPress,
  onStudentUpdate,
}: StudentProfileScreenProps) {
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();
  const deleteStudentMutation = useDeleteStudent();

  const targetId = studentId || student.id || '1';
  const profileQuery = useStudentProfile(targetId, !!targetId);

  const [activeTab, setActiveTab] = useState<StudentProfileTabType>(initialTab);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Toast Notification State
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'delete' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'delete' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const [currentStudent, setCurrentStudent] = useState<StudentProfileData>({
    ...DEFAULT_STUDENT_PROFILE,
    ...student,
    parentInfo: { ...DEFAULT_STUDENT_PROFILE.parentInfo, ...(student.parentInfo || {}) },
    personalInfo: { ...DEFAULT_STUDENT_PROFILE.personalInfo, ...(student.personalInfo || {}) },
    feeInfo: { ...DEFAULT_STUDENT_PROFILE.feeInfo, ...(student.feeInfo || {}) },
    attendanceStats: { ...DEFAULT_STUDENT_PROFILE.attendanceStats, ...(student.attendanceStats || {}) },
    attendanceGrid: student.attendanceGrid || DEFAULT_STUDENT_PROFILE.attendanceGrid,
    balanceSummary: { ...DEFAULT_STUDENT_PROFILE.balanceSummary, ...(student.balanceSummary || {}) },
    currentMonthFee: { ...DEFAULT_STUDENT_PROFILE.currentMonthFee, ...(student.currentMonthFee || {}) },
    transactions: student.transactions || DEFAULT_STUDENT_PROFILE.transactions,
  });

  // Sync API profile response
  useEffect(() => {
    if (profileQuery.data) {
      const mapped = mapApiProfileToStudentProfile(profileQuery.data);
      setCurrentStudent(mapped);
    } else if (student) {
      setCurrentStudent((prev) => ({
        ...prev,
        ...student,
        parentInfo: { ...prev.parentInfo, ...(student.parentInfo || {}) },
        personalInfo: { ...prev.personalInfo, ...(student.personalInfo || {}) },
        feeInfo: { ...prev.feeInfo, ...(student.feeInfo || {}) },
      }));
    }
  }, [profileQuery.data, student]);

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
        } else {
          router.replace('/(tabs)/students');
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
    const targetName = currentStudent.name;
    deleteStudentMutation.mutate(currentStudent.id, {
      onSuccess: () => {
        setIsDeleteModalVisible(false);
        showToast(`${targetName} deleted successfully!`, 'delete');
        setTimeout(() => {
          if (onDeletePress) {
            onDeletePress();
          } else {
            handleBack();
          }
        }, 1200);
      },
      onError: () => {
        setIsDeleteModalVisible(false);
      },
    });
  };

  if (isEditing) {
    return (
      <AddStudentScreen
        mode="edit"
        studentId={currentStudent.id}
        initialValues={{
          id: currentStudent.id,
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
        onSubmit={() => {
          profileQuery.refetch();
          showToast('Student details updated successfully!', 'success');
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <ScreenWrapper>
      {/* Toast Banner */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Top Header */}
      <Header
        variant="page"
        title="Student Profile"
        showBack={true}
        onBackPress={handleBack}
        rightIcon={<Trash size={20} color="#EF4444" variant="Linear" />}
        onRightPress={handleDelete}
      />

      {profileQuery.isLoading && !profileQuery.data ? (
        <StudentProfileSkeleton />
      ) : (
        /* Main Content Area */
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
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        itemName={currentStudent.name}
        isLoading={deleteStudentMutation.isPending}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </ScreenWrapper>
  );
}
