import React, { useState, useMemo } from 'react';
import { View, Text, Linking } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { Add, Diagram, Profile2User, Calendar } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import SortBottomSheet, { SortOptionItem } from '@/components/ui/SortBottomSheet';
import StudentOptionsBottomSheet from '@/components/ui/StudentOptionsBottomSheet';
import { StudentListItem } from '@/features/batches/StudentListScreen/StudentCard';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';

import AllStudentsStatCards from './AllStudentsStatCards';
import AllStudentsList from './AllStudentsList';

const STUDENT_SORT_OPTIONS: SortOptionItem[] = [
  { id: 'attendance_high', label: 'Attendance: High to Low', directionText: 'High to low', isAscending: false, icon: Diagram },
  { id: 'attendance_low', label: 'Attendance: Low to High', directionText: 'Low to high', isAscending: true, icon: Diagram },
  { id: 'name_asc', label: 'Name: A to Z', directionText: 'A to Z', isAscending: true, icon: Profile2User },
  { id: 'name_desc', label: 'Name: Z to A', directionText: 'Z to A', isAscending: false, icon: Profile2User },
  { id: 'recently_joined', label: 'Recently Joined', directionText: 'Newest first', isAscending: true, icon: Calendar },
];

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
    name: 'Arjun Verma',
    joinedDate: '15 Jul 2026',
    location: 'Sathya Stadium',
    attendancePercent: '85%',
    phone: '+91 9876543211',
    paymentStatus: 'overdue',
    amount: '₹1,200',
    attendanceRatio: '18/24',
    attendanceRatioStatus: 'success',
  },
  {
    id: '3',
    name: 'Kiran Kumar',
    joinedDate: '01 Jul 2026',
    location: 'Sathya Stadium',
    attendancePercent: '98%',
    phone: '+91 9876543212',
    paymentStatus: 'overdue',
    amount: '₹1,200',
    attendanceRatio: '23/24',
    attendanceRatioStatus: 'danger',
  },
  {
    id: '4',
    name: 'Priya Singh',
    joinedDate: '20 Jul 2026',
    location: 'Sathya Stadium',
    attendancePercent: '78%',
    phone: '+91 9876543213',
    paymentStatus: 'paid',
    amount: '₹1,200',
    paidDate: '12 Aug 2026',
    attendanceRatio: '16/24',
    attendanceRatioStatus: 'success',
  },
];

export interface AllStudentsOverviewProps {
  students?: StudentListItem[];
  totalStudents?: number;
  newThisMonth?: number;
  boysCount?: number;
  boysPercent?: number;
  girlsCount?: number;
  girlsPercent?: number;
  pendingFeesCount?: number;
  onBackPress?: () => void;
  onAddStudentPress?: () => void;
  onStudentPress?: (student: StudentListItem) => void;
}

export default function AllStudentsOverview({
  students = DEFAULT_STUDENTS,
  totalStudents = 26,
  newThisMonth = 18,
  boysCount = 72,
  boysPercent = 57,
  girlsCount = 54,
  girlsPercent = 43,
  pendingFeesCount = 7,
  onBackPress,
  onAddStudentPress,
  onStudentPress,
}: AllStudentsOverviewProps) {
  const { handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSortId, setSelectedSortId] = useState('attendance_high');
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [isOptionsSheetVisible, setIsOptionsSheetVisible] = useState(false);

  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);

  const filteredStudents = useMemo(() => {
    let result = students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.phone?.includes(q);

      const matchesTab =
        activeFilter === 'All' ||
        (activeFilter === 'Paid' && s.paymentStatus === 'paid') ||
        (activeFilter === 'Overdue' && s.paymentStatus === 'overdue');

      return matchesSearch && matchesTab;
    });

    // Apply sorting logic
    return [...result].sort((a, b) => {
      if (selectedSortId === 'attendance_high') {
        const attA = parseInt(a.attendancePercent?.replace('%', '') || '0', 10);
        const attB = parseInt(b.attendancePercent?.replace('%', '') || '0', 10);
        return attB - attA;
      }
      if (selectedSortId === 'attendance_low') {
        const attA = parseInt(a.attendancePercent?.replace('%', '') || '0', 10);
        const attB = parseInt(b.attendancePercent?.replace('%', '') || '0', 10);
        return attA - attB;
      }
      if (selectedSortId === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (selectedSortId === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (selectedSortId === 'recently_joined') {
        return (b.joinedDate || '').localeCompare(a.joinedDate || '');
      }
      return 0;
    });
  }, [students, searchQuery, activeFilter, selectedSortId]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleCallStudent = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleOpenOptions = (student: StudentListItem) => {
    setSelectedStudent(student);
    setIsOptionsSheetVisible(true);
  };

  const handleOpenAddStudent = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    if (onAddStudentPress) {
      onAddStudentPress();
    } else {
      setIsAddStudentVisible(true);
    }
  };

  if (isAddStudentVisible) {
    return (
      <AddStudentScreen
        onBackPress={() => setIsAddStudentVisible(false)}
        onSubmit={(data) => {
          console.log('New Student Data:', data);
          setIsAddStudentVisible(false);
        }}
      />
    );
  }

  return (
    <ScreenWrapper >
      {/* Header with Title "Students List" & Add (+) Button */}
      <Header
        variant="page"
        title="Students List"
        showBack={true}
        onBackPress={handleBack}
        rightIcon={Add}
        onRightPress={handleOpenAddStudent}
      />

      {/* Search Input Bar with Filter Button */}
      <View className=" mb-4 pt-1">
        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search student by name or phone..."
          showFilter={true}
          onFilterPress={() => setIsSortSheetVisible(true)}
        />
      </View>

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
        {/* Overview Section Header */}
        <Text className="text-[20px] font-urbanist-bold text-primary tracking-tight mb-3">
          Overview
        </Text>

        {/* Overview Stat Cards */}
        <AllStudentsStatCards
          totalStudents={totalStudents}
          newThisMonth={newThisMonth}
          boysCount={boysCount}
          boysPercent={boysPercent}
          girlsCount={girlsCount}
          girlsPercent={girlsPercent}
          pendingFeesCount={pendingFeesCount}
        />

        {/* Student List Section */}
        <AllStudentsList
          students={filteredStudents}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          onStudentPress={onStudentPress}
          onCallPress={handleCallStudent}
          onMorePress={handleOpenOptions}
        />
      </Animated.ScrollView>

      {/* Bottom Sheet Options */}
      {selectedStudent && (
        <StudentOptionsBottomSheet
          visible={isOptionsSheetVisible}
          student={selectedStudent}
          onClose={() => {
            setIsOptionsSheetVisible(false);
            setSelectedStudent(null);
          }}
          onViewProfile={() => {
            console.log('View Profile for:', selectedStudent.name);
          }}
          onEditStudent={() => {
            console.log('Edit Student for:', selectedStudent.name);
          }}
          onDeleteStudent={() => {
            console.log('Remove Student:', selectedStudent.name);
          }}
        />
      )}

      {/* Sort & Filter Bottom Sheet */}
      <SortBottomSheet
        visible={isSortSheetVisible}
        title="Sort & Filter Students"
        options={STUDENT_SORT_OPTIONS}
        selectedOptionId={selectedSortId}
        onSelectOption={(optionId) => setSelectedSortId(optionId)}
        onClose={() => setIsSortSheetVisible(false)}
      />
    </ScreenWrapper>
  );
}
