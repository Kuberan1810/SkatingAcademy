import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Linking, BackHandler } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { Add, Diagram, Profile2User, Calendar } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import SortBottomSheet, { SortOptionItem } from '@/components/ui/SortBottomSheet';
import StudentOptionsBottomSheet from '@/components/ui/StudentOptionsBottomSheet';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
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
  const [studentList, setStudentList] = useState<StudentListItem[]>(students);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSortId, setSelectedSortId] = useState('attendance_high');
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null);
  const [isOptionsSheetVisible, setIsOptionsSheetVisible] = useState(false);

  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);

  // Handle hardware back press on Android
  useEffect(() => {
    const backAction = () => {
      if (studentToDelete) {
        setStudentToDelete(null);
        return true;
      }
      if (isSortSheetVisible) {
        setIsSortSheetVisible(false);
        return true;
      }
      if (isOptionsSheetVisible) {
        setIsOptionsSheetVisible(false);
        setSelectedStudent(null);
        return true;
      }
      if (isAddStudentVisible) {
        setIsAddStudentVisible(false);
        return true;
      }
      if (studentToEdit) {
        setStudentToEdit(null);
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
  }, [
    studentToDelete,
    isSortSheetVisible,
    isOptionsSheetVisible,
    isAddStudentVisible,
    studentToEdit,
    onBackPress,
  ]);

  const filteredStudents = useMemo(() => {
    let result = studentList.filter((s) => {
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

  const handleCallStudent = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleOpenOptions = (student: StudentListItem) => {
    setSelectedStudent(student);
    setIsOptionsSheetVisible(true);
  };

  const navigateToProfile = (student: StudentListItem) => {
    router.push({
      pathname: '/(tabs)/students/[id]',
      params: {
        id: student.id,
        studentData: JSON.stringify({
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          joinedDate: student.joinedDate || '10 Jul 2026',
          location: student.location || 'Sathya Stadium',
          attendancePercent: student.attendancePercent || '92%',
          parentInfo: {
            parentName: student.parentName || 'Rajesh Sharma',
            phone: student.phone || '+91 98765 43210',
            emergency: student.emergencyContact || '+91 98765 43211',
          },
          personalInfo: {
            gender: student.gender || 'Male',
            dob: student.dob || '2012-05-14',
            bloodGroup: student.bloodGroup || 'B+',
            address: student.address || '12 MG Road, Bengaluru 560001',
          },
          feeInfo: {
            monthlyFee: student.amount || '₹2,400',
            pending: student.paymentStatus === 'paid' ? '₹0' : '₹1,200',
            status: student.paymentStatus === 'paid' ? 'PAID' : 'OVERDUE',
          },
          attendanceStats: {
            present: 86,
            absent: 4,
            attendancePercent: student.attendancePercent || '92%',
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
            { dayName: 'Thu', dayNumber: '21', internal: true, fullDate: '2026-01-22', status: 'none' },
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
            amount: student.amount || '₹1,250',
            status: student.paymentStatus === 'overdue' ? 'overdue' : 'paid',
            statusSubtext: student.paymentStatus === 'overdue' ? 'Over due' : 'Paid on 05 Aug',
            paymentDetails: student.paymentStatus === 'overdue' ? 'Due: 05 Aug 2026' : 'Paid by: GPay / Cash',
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
        }),
      },
    } as any);
  };

  const handleStudentPress = (student: StudentListItem) => {
    if (onStudentPress) {
      onStudentPress(student);
    } else {
      navigateToProfile(student);
    }
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

  if (studentToEdit) {
    return (
      <AddStudentScreen
        mode="edit"
        initialValues={{
          avatarUri: typeof studentToEdit.avatar === 'string' ? studentToEdit.avatar : null,
          fullName: studentToEdit.name,
          gender: studentToEdit.gender || 'Male',
          dob: studentToEdit.dob || '2012-05-14',
          bloodGroup: studentToEdit.bloodGroup || 'B+',
          batch: studentToEdit.location || 'Morning Beginners',
          joinDate: studentToEdit.joinedDate || '',
          parentName: studentToEdit.parentName || 'Rajesh Sharma',
          phoneNumber: studentToEdit.phone || '+91 98765 43210',
          emergencyContact: studentToEdit.emergencyContact || '+91 98765 43211',
          monthlyFee: studentToEdit.amount || '₹1,250',
        }}
        onBackPress={() => setStudentToEdit(null)}
        onSubmit={(updated) => {
          const updatedItem: StudentListItem = {
            ...studentToEdit,
            name: updated.fullName || studentToEdit.name,
            location: updated.batch || studentToEdit.location,
            phone: updated.phoneNumber || studentToEdit.phone,
            amount: updated.monthlyFee || studentToEdit.amount,
            joinedDate: updated.joinDate || studentToEdit.joinedDate,
            parentName: updated.parentName || studentToEdit.parentName,
            emergencyContact: updated.emergencyContact || studentToEdit.emergencyContact,
            gender: (updated.gender as any) || studentToEdit.gender,
            dob: updated.dob || studentToEdit.dob,
            bloodGroup: updated.bloodGroup || studentToEdit.bloodGroup,
            avatar: updated.avatarUri || studentToEdit.avatar,
          };
          setStudentList((prev) =>
            prev.map((s) => (s.id === studentToEdit.id ? updatedItem : s))
          );
          setStudentToEdit(null);
        }}
      />
    );
  }

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
          onStudentPress={handleStudentPress}
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
            const studentToView = selectedStudent;
            setIsOptionsSheetVisible(false);
            setSelectedStudent(null);
            if (studentToView) {
              navigateToProfile(studentToView);
            }
          }}
          onEditStudent={(st) => {
            const studentTarget = st || selectedStudent;
            setIsOptionsSheetVisible(false);
            setSelectedStudent(null);
            if (studentTarget) {
              setStudentToEdit(studentTarget);
            }
          }}
          onDeleteStudent={(st) => {
            const studentTarget = st || selectedStudent;
            setIsOptionsSheetVisible(false);
            setSelectedStudent(null);
            setTimeout(() => {
              setStudentToDelete(studentTarget);
            }, 250);
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={!!studentToDelete}
        itemName={studentToDelete?.name}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            setStudentList((prev) => prev.filter((s) => s.id !== studentToDelete.id));
            setStudentToDelete(null);
          }
        }}
      />
    </ScreenWrapper>
  );
}
