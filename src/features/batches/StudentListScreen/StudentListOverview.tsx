import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import StudentOptionsBottomSheet from '@/components/ui/StudentOptionsBottomSheet';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import styles from '@/styles/styles';
import { router } from 'expo-router';
import { Setting2, Layer, Trash } from 'iconsax-react-native';
import React, { useMemo, useState, useEffect } from 'react';
import { Linking, Text, View, BackHandler } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';
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
  onDeleteBatchPress?: () => void;
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
  onDeleteBatchPress,
}: StudentListOverviewProps) {
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();

  const [studentList, setStudentList] = useState<StudentListItem[]>(students);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null);
  const [isOptionsSheetVisible, setIsOptionsSheetVisible] = useState(false);
  const [isDeleteBatchModalVisible, setIsDeleteBatchModalVisible] = useState(false);

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  useEffect(() => {
    if (!studentToEdit) {
      hideTabBar();
    }
  }, [studentToEdit, hideTabBar]);

  // Handle hardware back press on Android
  useEffect(() => {
    const backAction = () => {
      if (isDeleteBatchModalVisible) {
        setIsDeleteBatchModalVisible(false);
        return true;
      }
      if (isOptionsSheetVisible) {
        setIsOptionsSheetVisible(false);
        setSelectedStudent(null);
        return true;
      }
      if (studentToDelete) {
        setStudentToDelete(null);
        return true;
      }
      if (studentToEdit) {
        setStudentToEdit(null);
        hideTabBar();
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
    isDeleteBatchModalVisible,
    isOptionsSheetVisible,
    studentToDelete,
    studentToEdit,
    hideTabBar,
  ]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentList;
    const q = searchQuery.toLowerCase();
    return studentList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.joinedDate.toLowerCase().includes(q)
    );
  }, [studentList, searchQuery]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      try {
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/(tabs)/batches' as any);
      } catch (e) {
        console.log('Navigation back error:', e);
      }
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

  const navigateToProfile = (student: StudentListItem) => {
    router.push({
      pathname: '/(tabs)/batches/student-profile',
      params: {
        id: student.id,
        studentData: JSON.stringify({
          id: student.id,
          name: student.name,
          avatar: student.avatar,
          joinedDate: student.joinedDate || '10 Jul 2026',
          location: student.location || batchName,
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
              status: student.paymentStatus === 'overdue' ? 'OVERDUE' : 'PAID',
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

  if (studentToEdit) {
    return (
      <AddStudentScreen
        mode="edit"
        initialValues={{
          fullName: studentToEdit.name,
          gender: studentToEdit.gender || 'Male',
          dob: studentToEdit.dob || '2012-05-14',
          bloodGroup: studentToEdit.bloodGroup || 'B+',
          batch: studentToEdit.location || batchName,
          joinDate: studentToEdit.joinedDate || '',
          parentName: studentToEdit.parentName || 'Rajesh Sharma',
          phoneNumber: studentToEdit.phone || '+91 98765 43210',
          emergencyContact: studentToEdit.emergencyContact || '+91 98765 43211',
          monthlyFee: studentToEdit.amount || '₹1,200',
        }}
        onBackPress={() => {
          setStudentToEdit(null);
          hideTabBar();
        }}
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
          hideTabBar();
        }}
      />
    );
  }

  return (
    <ScreenWrapper>
      {/* Top Navigation Header */}
      <Header
        variant="page"
        title={batchTitle}
        showBack={true}
        onBackPress={handleBack}
        rightIcon={<Trash size={20} color="#EF4444" variant="Linear" />}
        onRightPress={() => {
          setIsDeleteBatchModalVisible(true);
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
                onPress={handleStudentPress}
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
          const studentTarget = st || selectedStudent;
          handleCloseOptions();
          if (studentTarget) {
            navigateToProfile(studentTarget);
          }
        }}
        onEditStudent={(st) => {
          const studentTarget = st || selectedStudent;
          handleCloseOptions();
          if (studentTarget) {
            setStudentToEdit(studentTarget);
          }
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
          const studentTarget = st || selectedStudent;
          handleCloseOptions();
          setTimeout(() => {
            setStudentToDelete(studentTarget);
          }, 250);
        }}
      />

      {/* Delete Student Confirmation Modal */}
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

      {/* Delete Batch Confirmation Sheet */}
      <DeleteConfirmationModal
        visible={isDeleteBatchModalVisible}
        title="Delete Batch"
        itemName={batchName}
        message={`Are you sure you want to remove ${batchName}? All enrolled students in this batch will be affected. This action cannot be undone.`}
        confirmText="Yes, Delete"
        onClose={() => setIsDeleteBatchModalVisible(false)}
        onConfirm={() => {
          setIsDeleteBatchModalVisible(false);
          if (onDeleteBatchPress) {
            onDeleteBatchPress();
          } else {
            handleBack();
          }
        }}
      />
    </ScreenWrapper>
  );
}
