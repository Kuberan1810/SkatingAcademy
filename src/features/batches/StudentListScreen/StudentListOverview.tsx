import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import { router } from 'expo-router';
import { Setting2 } from 'iconsax-react-native';
import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import StudentCard, { StudentListItem } from './StudentCard';
import StudentStatCards from './StudentStatCards';

const DEFAULT_STUDENTS: StudentListItem[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    joinedDate: '10 Jul 2026',
    location: 'Sathya Stadium',
    attendancePercent: '92%',
    phone: '+91 9876543210',
    paymentStatus: 'paid',
    amount: '₹1,200',
    paidDate: '12 Aug 2026',
    attendanceRatio: '20/24',
    attendanceRatioStatus: 'success',
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    joinedDate: '10 Jul 2026',
    location: 'Sathya Stadium',
    attendancePercent: '92%',
    phone: '+91 9876543211',
    paymentStatus: 'overdue',
    amount: '₹1,200',
    attendanceRatio: '20/24',
    attendanceRatioStatus: 'success',
  },
  {
    id: '3',
    name: 'Rahul Sharma',
    joinedDate: '10 Jul 2026',
    location: 'Sathya Stadium',
    attendancePercent: '92%',
    phone: '+91 9876543212',
    paymentStatus: 'overdue',
    amount: '₹1,200',
    attendanceRatio: '20/24',
    attendanceRatioStatus: 'danger',
  },
  {
    id: '4',
    name: 'Rahul Sharma',
    joinedDate: '10 Jul 2026',
    location: 'Sathya Stadium',
    attendancePercent: '92%',
    phone: '+91 9876543213',
    paymentStatus: 'paid',
    amount: '₹1,200',
    paidDate: '12 Aug 2026',
    attendanceRatio: '20/24',
    attendanceRatioStatus: 'success',
  },
];

export interface StudentListOverviewProps {
  batchTitle?: string;
  batchName?: string;
  batchSubtitle?: string;
  totalStudents?: string | number;
  avgAttendance?: string;
  students?: StudentListItem[];
  onBackPress?: () => void;
  onStudentPress?: (student: StudentListItem) => void;
}

export default function StudentListOverview({
  batchTitle = 'Sathya Stadium Students',
  batchName = 'Morning Batch (6:00 AM - 7:30 AM)',
  batchSubtitle = 'View, manage, and track student information',
  totalStudents = '90 Students',
  avgAttendance = '92%',
  students = DEFAULT_STUDENTS,
  onBackPress,
  onStudentPress,
}: StudentListOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.joinedDate.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <ScreenWrapper>
      {/* Top Navigation Header */}
      <Header
        variant="page"
        title={batchTitle}
        onBackPress={handleBack}
        rightIcon={Setting2}
        onRightPress={() => {
          console.log('Settings pressed');
        }}
      />

      {/* Search Input */}
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search students, batches..."
        showFilter={false}
      />

      {/* Main Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1}
        decelerationRate={0.998}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 120,
        }}
      >
        {/* Batch Header Info */}

        <Text className="text-[24px] font-urbanist-bold text-primary mb-1.5">
       {batchName}
        </Text>
        <Text className="text-[16px] font-urbanist-medium text-secondary mb-5">
          {batchSubtitle}
        </Text>
       

        {/* Reusable Stat Cards Row */}
        <StudentStatCards
          totalStudents={totalStudents}
          avgAttendance={avgAttendance}
          className="mb-6"
        />

        {/* Student List Section Title */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[22px] font-urbanist-bold text-primary tracking-tight">
            Student List
          </Text>
        </View>

        {/* Student List Cards */}
        <View className="gap-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onPress={onStudentPress}
                onMorePress={(st) =>
                  console.log('More options for student:', st.name)
                }
              />
            ))
          ) : (
            <View className="bg-white rounded-[24px] p-8 items-center justify-center border border-[#E5E5EA]">
              <Text className="text-[16px] font-urbanist-semibold text-secondary">
                No students found matching "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
