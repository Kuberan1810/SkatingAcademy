import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Toast from '@/components/ui/Toast';
import { router, useNavigation } from 'expo-router';
import { Setting2, User } from 'iconsax-react-native';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BackHandler, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import AttendanceSummarySheet from './AttendanceSummarySheet';
import ExitClassAlertSheet from './ExitClassAlertSheet';
import StartClassSummary from './StartClassSummary';
import SaveAttendanceButton from './StudentAttendanceButton';
import { AttendanceStatus, StudentData } from './StudentAttendanceCard';
import StudentList from './StudentList';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import { useConfirmAttendance } from '@/hooks/use-attendance';
import { getErrorMessage } from '@/utils/error';
import styles from '@/styles/styles';

export interface StartClassOverviewProps {
  batchTitle?: string;
  batchName?: string;
  dateText?: string;
  students?: StudentData[];
  sessionId?: string;
  isCompensationClass?: boolean;
  compensationReason?: string | null;
  onBackPress?: () => void;
  onSave?: (attendance: Record<string, AttendanceStatus>) => void;
}

export default function StartClassOverview({
  batchTitle = 'Class Students',
  batchName = 'Class Session',
  dateText = 'Today',
  students = [],
  sessionId,
  isCompensationClass = false,
  compensationReason,
  onBackPress,
  onSave,
}: StartClassOverviewProps) {
  const { hideTabBar, showTabBar } = useTabBarVisibility();
  const confirmAttendanceMutation = useConfirmAttendance();

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSummarySheet, setShowSummarySheet] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const isLeavingRef = useRef(false);

  // Intercept React Navigation back action / swipe gesture
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isLeavingRef.current) {
        return;
      }
      e.preventDefault();
      setShowExitModal(true);
    });

    return unsubscribe;
  }, [navigation]);

  // Intercept Android Hardware Back Button
  useEffect(() => {
    const onHardwareBack = () => {
      if (showSummarySheet) {
        setShowSummarySheet(false);
        return true;
      }
      setShowExitModal(true);
      return true;
    };

    const backSub = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBack
    );

    return () => {
      backSub.remove();
    };
  }, [showSummarySheet]);

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

  const activeStudents = students || [];

  // Attendance state for all students
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >(() => {
    const initialMap: Record<string, AttendanceStatus> = {};
    activeStudents.forEach((s) => {
      initialMap[s.id] = s.attendanceStatus || 'present';
    });
    return initialMap;
  });

  useEffect(() => {
    if (students && students.length > 0) {
      const newMap: Record<string, AttendanceStatus> = {};
      students.forEach((s) => {
        newMap[s.id] = s.attendanceStatus || 'present';
      });
      setAttendanceMap(newMap);
    }
  }, [students]);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return activeStudents;
    return activeStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batchName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeStudents, searchQuery]);

  // Check if all students are present
  const allSelected = useMemo(() => {
    if (activeStudents.length === 0) return false;
    return activeStudents.every((s) => attendanceMap[s.id] === 'present');
  }, [activeStudents, attendanceMap]);

  // Toggle Mark All Present
  const handleToggleSelectAll = (value: boolean) => {
    const newMap: Record<string, AttendanceStatus> = {};
    activeStudents.forEach((s) => {
      newMap[s.id] = value ? 'present' : 'none';
    });
    setAttendanceMap(newMap);
  };

  // Toggle individual student attendance
  const handleAttendanceChange = (id: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  // Open attendance summary sheet with mandatory validation check
  const handleSaveAttendance = () => {
    const unmarkedStudent = activeStudents.find(
      (s) => !attendanceMap[s.id] || attendanceMap[s.id] === 'none'
    );

    if (unmarkedStudent) {
      showToast(`Please mark attendance for ${unmarkedStudent.name}`, 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSummarySheet(true);
    }, 300);
  };

  // Confirm attendance (Calls POST /api/v1/attendance)
  const handleConfirmAttendance = () => {
    const targetSessionId = Number(sessionId || 1);

    const attendanceRecords = activeStudents.map((s) => ({
      student_id: Number(s.id),
      status: (attendanceMap[s.id] === 'absent' ? 'Absent' : 'Present') as 'Present' | 'Absent',
    }));

    confirmAttendanceMutation.mutate(
      {
        session_id: targetSessionId,
        attendance: attendanceRecords,
      },
      {
        onSuccess: () => {
          isLeavingRef.current = true;
          setShowSummarySheet(false);
          showToast('Attendance Confirmed & Class Completed!', 'success');
          setTimeout(() => {
            if (onSave) {
              onSave(attendanceMap);
            } else if (onBackPress) {
              onBackPress();
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/batches' as any);
            }
          }, 1200);
        },
        onError: (err) => {
          setShowSummarySheet(false);
          const msg = getErrorMessage(err, 'Failed to confirm attendance');
          showToast(msg, 'error');
        },
      }
    );
  };

  const handleBack = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    isLeavingRef.current = true;
    setShowExitModal(false);
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/dashboard' as any);
    }
  };

  return (
    <ScreenWrapper>
      {/* Toast Notification Banner */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <Header
        variant="page"
        title={batchTitle}
        onBackPress={handleBack}
        rightIcon={Setting2}
      />

      {/* Search Input */}
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search students, batches.."
        showFilter={false}
      />

      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1}
        decelerationRate={0.998}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
      >
        {/* Batch Info Summary */}
        <StartClassSummary
          date={dateText}
          batchName={batchName}
          totalStudents={activeStudents.length}
          allSelected={allSelected}
          isCompensationClass={isCompensationClass}
          compensationReason={compensationReason}
          onToggleSelectAll={handleToggleSelectAll}
        />

        {/* Student List */}
        {activeStudents.length > 0 ? (
          <StudentList
            students={filteredStudents}
            attendanceMap={attendanceMap}
            onAttendanceChange={handleAttendanceChange}
          />
        ) : (
          <View style={styles.BoxStyle} className="py-8 items-center justify-center my-6">
            <View style={styles.IconStyle} className="mb-2 p-2.5">
              <User size={24} color="#8A8A8E" variant="Linear" />
            </View>
            <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
              No Students Found
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
              There are no enrolled students in this session.
            </Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Sticky Bottom Action Button */}
      {activeStudents.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0">
          <SaveAttendanceButton
            loading={isSaving}
            onPress={handleSaveAttendance}
          />
        </View>
      )}

      {/* Attendance Summary Bottom Sheet */}
      <AttendanceSummarySheet
        visible={showSummarySheet}
        batchName={batchName}
        dateText={dateText}
        students={activeStudents}
        attendanceMap={attendanceMap}
        confirmLoading={confirmAttendanceMutation.isPending}
        onClose={() => setShowSummarySheet(false)}
        onEditAttendance={() => setShowSummarySheet(false)}
        onConfirmAttendance={handleConfirmAttendance}
      />

      {/* Exit Class Warning Alert Sheet */}
      <ExitClassAlertSheet
        visible={showExitModal}
        title="Leave Class Session?"
        message="Are you sure you want to leave? If you exit now, this session will automatically be marked empty and you will not be able to restart it."
        confirmText="Yes, Exit"
        cancelText="Stay in Session"
        onClose={() => setShowExitModal(false)}
        onConfirm={handleConfirmExit}
      />
    </ScreenWrapper>
  );
}
