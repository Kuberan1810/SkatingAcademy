import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import SortBottomSheet, { SortOptionItem } from '@/components/ui/SortBottomSheet';
import StudentOptionsBottomSheet from '@/components/ui/StudentOptionsBottomSheet';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import styles from '@/styles/styles';
import { router } from 'expo-router';
import { Setting2, User } from 'iconsax-react-native';
import React, { useMemo, useState, useEffect } from 'react';
import { Text, View, BackHandler, Linking, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import ScreenWrapper from '@/components/screen-wrapper';
import FiltersTabs from '@/components/ui/FiltersTabs';
import StudentCard, { StudentListItem } from './StudentCard';
import StudentStatCards from './StudentStatCards';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import { useDeleteStudent } from '@/hooks/use-students';
import { useIncrementalList } from '@/hooks/use-incremental-list';

const SORT_OPTIONS: SortOptionItem[] = [
  { id: 'attendance_high', label: 'Attendance: High to Low', directionText: 'High to low', isAscending: false },
  { id: 'attendance_low', label: 'Attendance: Low to High', directionText: 'Low to high', isAscending: true },
  { id: 'name_asc', label: 'Name: A to Z', directionText: 'A to Z', isAscending: true },
  { id: 'name_desc', label: 'Name: Z to A', directionText: 'Z to A', isAscending: false },
  { id: 'recently_joined', label: 'Recently Joined', directionText: 'Newest first', isAscending: true },
];

const DEFAULT_STUDENTS: StudentListItem[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    joinedDate: '10 Jul 2026',
    location: 'Sathya Stadium',
    attendancePercent: '92%',
    phone: '+91 98765 43210',
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
    phone: '+91 98765 43211',
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
    phone: '+91 98765 43212',
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
    phone: '+91 98765 43213',
    paymentStatus: 'paid',
    amount: '₹1,200',
    paidDate: '12 Aug 2026',
    attendanceRatio: '16/24',
    attendanceRatioStatus: 'success',
  },
];

export interface StudentListOverviewProps {
  batchName?: string;
  batchTitle?: string;
  batchSubtitle?: string;
  totalStudents?: number;
  avgAttendance?: string;
  students?: StudentListItem[];
  onBackPress?: () => void;
  onEditBatchPress?: () => void;
  onDeleteBatchPress?: () => void;
  onStudentPress?: (student: StudentListItem) => void;
}

export default function StudentListOverview({
  batchName: propBatchName,
  batchTitle,
  batchSubtitle = 'Advanced • 06:00 – 07:30 AM • Sathya Stadium',
  totalStudents = 24,
  avgAttendance = '92%',
  students = DEFAULT_STUDENTS,
  onBackPress,
  onEditBatchPress,
  onDeleteBatchPress,
  onStudentPress,
}: StudentListOverviewProps) {
  const batchName = propBatchName || batchTitle || 'Morning Advanced Batch';
  const { handleScroll } = useTabBarVisibility();
  const deleteStudentMutation = useDeleteStudent();

  const [studentList, setStudentList] = useState<StudentListItem[]>(students);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSortId, setSelectedSortId] = useState('attendance_high');
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null);
  const [isOptionsSheetVisible, setIsOptionsSheetVisible] = useState(false);
  const [isDeleteBatchModalVisible, setIsDeleteBatchModalVisible] = useState(false);
  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);

  useEffect(() => {
    setStudentList(students);
  }, [students]);

  // Handle hardware back press on Android
  useEffect(() => {
    const backAction = () => {
      if (studentToDelete) {
        setStudentToDelete(null);
        return true;
      }
      if (isDeleteBatchModalVisible) {
        setIsDeleteBatchModalVisible(false);
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
    isDeleteBatchModalVisible,
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
  }, [studentList, searchQuery, activeFilter, selectedSortId]);

  const {
    displayedItems: displayedStudents,
    hasMore: hasMoreStudents,
    onScroll: onIncrementalScroll,
  } = useIncrementalList({
    items: filteredStudents,
    pageSize: 10,
  });

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

  const handleOpenOptions = (student: StudentListItem) => {
    setSelectedStudent(student);
    setIsOptionsSheetVisible(true);
  };

  const handleCloseOptions = () => {
    setIsOptionsSheetVisible(false);
    setSelectedStudent(null);
  };

  const navigateToProfile = (
    student: StudentListItem,
    initialTab: 'overview' | 'attendance' | 'payments' = 'overview'
  ) => {
    router.push({
      pathname: '/(tabs)/students/[id]',
      params: {
        id: student.id,
        initialTab: initialTab,
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
        }),
      },
    } as any);
  };

  const handleStudentPress = (student: StudentListItem) => {
    if (onStudentPress) {
      onStudentPress(student);
    } else {
      navigateToProfile(student, 'overview');
    }
  };

  if (studentToEdit) {
    return (
      <AddStudentScreen
        mode="edit"
        studentId={studentToEdit.id}
        initialValues={{
          id: studentToEdit.id,
          avatarUri: typeof studentToEdit.avatar === 'string' ? studentToEdit.avatar : null,
          fullName: studentToEdit.name,
          gender: studentToEdit.gender || 'Male',
          dob: studentToEdit.dob || '2012-05-14',
          bloodGroup: studentToEdit.bloodGroup || 'O+',
          batch: studentToEdit.location || 'Morning Beginners',
          joinDate: studentToEdit.joinedDate || '',
          parentName: studentToEdit.parentName || 'Rajesh Sharma',
          phoneNumber: studentToEdit.phone || '+91 98765 43210',
          emergencyContact: studentToEdit.emergencyContact || '+91 98765 43211',
          monthlyFee: studentToEdit.amount || '₹1,250',
        }}
        onBackPress={() => setStudentToEdit(null)}
        onSubmit={() => {
          setStudentToEdit(null);
        }}
      />
    );
  }

  if (isAddStudentVisible) {
    return (
      <AddStudentScreen
        onBackPress={() => setIsAddStudentVisible(false)}
        onSubmit={() => {
          setIsAddStudentVisible(false);
        }}
      />
    );
  }

  return (
    <ScreenWrapper>
      {/* Header with Title "Students List" & Edit Action Icon */}
      <Header
        variant="page"
        title="Students List"
        showBack={true}
        onBackPress={handleBack}
        rightIcon={Setting2}
        onRightPress={() => {
          if (onEditBatchPress) onEditBatchPress();
        }}
      />

      {/* Search Input Bar with Filter Button */}
      <View className="mb-4 pt-1">
        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search student by name or phone..."
          showFilter={true}
          onFilterPress={() => setIsSortSheetVisible(true)}
        />
      </View>

      <Animated.ScrollView
        onScroll={(e) => {
          handleScroll(e);
          onIncrementalScroll(e);
        }}
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
        {/* Dynamic Filter Tabs Pill Header */}
        <FiltersTabs
          tabs={['All', 'Paid', 'Overdue']}
          activeTab={activeFilter}
          onSelectTab={setActiveFilter}
          containerClassName="mb-5"
        />

        {/* Batch Title Header */}
        <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight mb-1">
          {batchName}
        </Text>

        {/* Batch Subtitle / Details Pill */}
        <Text className="text-[14px] font-urbanist-medium text-secondary tracking-tight mb-5">
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
            <>
              {displayedStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onPress={handleStudentPress}
                  onMorePress={handleOpenOptions}
                />
              ))}
              {hasMoreStudents && (
                <View className="py-4 flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="#8A8A8E" />
                  <Text className="text-[13px] font-urbanist-medium text-secondary">
                    Loading more students...
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.BoxStyle} className="py-8 items-center justify-center">
              <View style={styles.IconStyle} className="mb-2 p-2.5">
                <User size={24} color="#8A8A8E" variant="Linear" />
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
            navigateToProfile(studentTarget, 'overview');
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
          const target = st || selectedStudent;
          handleCloseOptions();
          if (target?.phone) {
            Linking.openURL(`tel:${target.phone.replace(/[^0-9+]/g, '')}`);
          }
        }}
        onAttendanceHistory={(st) => {
          const target = st || selectedStudent;
          handleCloseOptions();
          if (target) {
            navigateToProfile(target, 'attendance');
          }
        }}
        onPaymentHistory={(st) => {
          const target = st || selectedStudent;
          handleCloseOptions();
          if (target) {
            navigateToProfile(target, 'payments');
          }
        }}
        onDeleteStudent={(st) => {
          const studentTarget = st || selectedStudent;
          handleCloseOptions();
          setTimeout(() => {
            setStudentToDelete(studentTarget);
          }, 250);
        }}
      />

      {/* Sort & Filter Bottom Sheet */}
      <SortBottomSheet
        visible={isSortSheetVisible}
        title="Sort & Filter Students"
        options={SORT_OPTIONS}
        selectedOptionId={selectedSortId}
        onSelectOption={(optionId) => setSelectedSortId(optionId)}
        onClose={() => setIsSortSheetVisible(false)}
      />

      {/* Delete Student Confirmation Modal */}
      <DeleteConfirmationModal
        visible={!!studentToDelete}
        itemName={studentToDelete?.name}
        isLoading={deleteStudentMutation.isPending}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            deleteStudentMutation.mutate(studentToDelete.id, {
              onSuccess: () => {
                setStudentList((prev) => prev.filter((s) => s.id !== studentToDelete.id));
                setStudentToDelete(null);
              },
              onError: () => {
                setStudentToDelete(null);
              },
            });
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
