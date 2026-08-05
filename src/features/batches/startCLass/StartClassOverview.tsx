import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import { router } from 'expo-router';
import { Setting2, TickCircle } from 'iconsax-react-native';
import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import AttendanceSummarySheet from './AttendanceSummarySheet';
import StartClassSummary from './StartClassSummary';
import SaveAttendanceButton from './StudentAttendanceButton';
import { AttendanceStatus, StudentData } from './StudentAttendanceCard';
import StudentList from './StudentList';

const INITIAL_STUDENTS: StudentData[] = [
  { id: '1', name: 'Rahul Sharma', batchName: 'Morning Batch' },
  { id: '2', name: 'Priya Menon', batchName: 'Morning Batch' },
  { id: '3', name: 'Arjun Nair', batchName: 'Morning Batch' },
  { id: '4', name: 'Sneha Patel', batchName: 'Morning Batch' },
  { id: '5', name: 'Kiran Das', batchName: 'Morning Batch' },
  { id: '6', name: 'Anjali Rao', batchName: 'Morning Batch' },
  { id: '7', name: 'Vikram Iyer', batchName: 'Morning Batch' },
  { id: '8', name: 'Deepa Krishnan', batchName: 'Morning Batch' },
  { id: '9', name: 'Arun Kumar', batchName: 'Morning Batch' },
];

export interface StartClassOverviewProps {
  batchTitle?: string;
  batchName?: string;
  dateText?: string;
  students?: StudentData[];
  onSave?: (attendance: Record<string, AttendanceStatus>) => void;
}

export default function StartClassOverview({
  batchTitle = 'Sathya Stadium Students',
  batchName = 'Morning Batch (6:00 AM - 7:30 AM)',
  dateText = 'Today · Oct 24, 2023',
  students = INITIAL_STUDENTS,
  onSave,
}: StartClassOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showSummarySheet, setShowSummarySheet] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Attendance state for all students
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >(() => {
    const initialMap: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      initialMap[s.id] = 'present';
    });
    return initialMap;
  });

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batchName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Check if all students are present
  const allSelected = useMemo(() => {
    if (students.length === 0) return false;
    return students.every((s) => attendanceMap[s.id] === 'present');
  }, [students, attendanceMap]);

  // Toggle Mark All Present
  const handleToggleSelectAll = (value: boolean) => {
    const newMap: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
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

  // Open attendance summary sheet with loading state
  const handleSaveAttendance = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSummarySheet(true);
    }, 600);
  };

  // Confirm attendance (final save with button loader & success toast)
  const handleConfirmAttendance = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setShowSummarySheet(false);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        if (onSave) {
          onSave(attendanceMap);
        } else {
          router.back();
        }
      }, 1500);
    }, 700);
  };

  return (
    <ScreenWrapper>
      {/* Success Toast Notification */}
      {showToast && (
        <Animated.View
          entering={FadeInUp.duration(250)}
          exiting={FadeOutUp.duration(200)}
          className="absolute top-12 left-5 right-5 z-50 bg-[#167D44] rounded-[18px] p-4 flex-row items-center gap-3 shadow-lg"
        >
          <TickCircle size={24} color="#FFFFFF" variant="Bold" />
          <View className="flex-1">
            <Text className="text-[15px] font-urbanist-bold text-white">
              Attendance Saved Successfully!
            </Text>
            <Text className="text-[12px] font-urbanist-medium text-white/90">
              Batch records have been updated.
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Header */}
      <Header
        variant="page"
        title={batchTitle}
        onBackPress={() => router.back()}
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
          totalStudents={students.length > 0 ? students.length : 0}
          allSelected={allSelected}
          onToggleSelectAll={handleToggleSelectAll}
        />

        {/* Student List */}
        <StudentList
          students={filteredStudents}
          attendanceMap={attendanceMap}
          onAttendanceChange={handleAttendanceChange}
        />
      </Animated.ScrollView>

      {/* Sticky Bottom Action Button */}
      <View className="absolute bottom-0 left-0 right-0">
        <SaveAttendanceButton
          loading={isSaving}
          onPress={handleSaveAttendance}
        />
      </View>

      {/* Attendance Summary Bottom Sheet */}
      <AttendanceSummarySheet
        visible={showSummarySheet}
        batchName={batchName}
        dateText={dateText}
        students={students}
        attendanceMap={attendanceMap}
        confirmLoading={confirmLoading}
        onClose={() => setShowSummarySheet(false)}
        onEditAttendance={() => setShowSummarySheet(false)}
        onConfirmAttendance={handleConfirmAttendance}
      />
    </ScreenWrapper>
  );
}
