import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import StudentOptionsBottomSheet from '@/components/ui/StudentOptionsBottomSheet';
import styles from '@/styles/styles';
import { router } from 'expo-router';
import { Setting2, Layer } from 'iconsax-react-native';
import React, { useMemo, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
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
  const { handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [isOptionsSheetVisible, setIsOptionsSheetVisible] = useState(false);

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
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/batches' as any);
    }
  };

  const handleOpenOptions = (student: StudentListItem) => {
    setSelectedStudent(student);
    setIsOptionsSheetVisible(true);
  };

  const handleCloseOptions = () => {
    setIsOptionsSheetVisible(false);
    setSelectedStudent(null);
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
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
                onMorePress={handleOpenOptions}
              />
            ))
          ) : (
            <View style={styles.BoxStyle} className="py-8 items-center justify-center">
              <View style={styles.IconStyle} className="mb-2 p-2.5">
                <Layer size={24} color="#8A8A8E" variant="Linear" />
              </View>
              <Text className="text-[18px] font-urbanist-semibold text-primary tracking-tight">
                No Students Found
              </Text>
              <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
                There are no students matching your selected filter.
              </Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Student Options Bottom Sheet Drawer */}
      <StudentOptionsBottomSheet
        visible={isOptionsSheetVisible}
        student={selectedStudent}
        onClose={handleCloseOptions}
        onViewProfile={(st) => {
          console.log('View Profile for:', st.name);
          onStudentPress?.(st);
        }}
        onEditStudent={(st) => {
          console.log('Edit Student:', st.name);
        }}
        onCallParent={(st) => {
          if (st.phone) {
            Linking.openURL(`tel:${st.phone}`);
          }
        }}
        onAttendanceHistory={(st) => {
          console.log('Attendance History for:', st.name);
        }}
        onPaymentHistory={(st) => {
          console.log('Payment History for:', st.name);
        }}
        onDeleteStudent={(st) => {
          console.log('Delete Student:', st.name);
        }}
      />
    </ScreenWrapper>
  );
}
