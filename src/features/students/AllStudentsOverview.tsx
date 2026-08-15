import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Linking, BackHandler, RefreshControl } from 'react-native';
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
import Toast from '@/components/ui/Toast';
import { StudentListItem } from '@/features/batches/StudentListScreen/StudentCard';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';
import { OverviewSkeleton } from '@/components/ui/Skeleton';
import { useStudentsPage, useDeleteStudent } from '@/hooks/use-students';
import { useIncrementalList } from '@/hooks/use-incremental-list';

import AllStudentsStatCards from './AllStudentsStatCards';
import AllStudentsList from './AllStudentsList';

const STUDENT_SORT_OPTIONS: SortOptionItem[] = [
  { id: 'attendance_high', label: 'Attendance: High to Low', directionText: 'High to low', isAscending: false, icon: Diagram },
  { id: 'attendance_low', label: 'Attendance: Low to High', directionText: 'Low to high', isAscending: true, icon: Diagram },
  { id: 'name_asc', label: 'Name: A to Z', directionText: 'A to Z', isAscending: true, icon: Profile2User },
  { id: 'name_desc', label: 'Name: Z to A', directionText: 'Z to A', isAscending: false, icon: Profile2User },
  { id: 'recently_joined', label: 'Recently Joined', directionText: 'Newest first', isAscending: true, icon: Calendar },
];

export interface AllStudentsOverviewProps {
  onBackPress?: () => void;
  onAddStudentPress?: () => void;
  onStudentPress?: (student: StudentListItem) => void;
}

export default function AllStudentsOverview({
  onBackPress,
  onAddStudentPress,
  onStudentPress,
}: AllStudentsOverviewProps) {
  const { handleScroll } = useTabBarVisibility();
  const { data: pageData, isLoading: isPageLoading, refetch: refetchPage } = useStudentsPage();
  const deleteStudentMutation = useDeleteStudent();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSortId, setSelectedSortId] = useState('attendance_high');
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null);
  const [isOptionsSheetVisible, setIsOptionsSheetVisible] = useState(false);
  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);

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

  // Map API students array to UI StudentListItem format
  const apiStudentsList: StudentListItem[] = useMemo(() => {
    if (!pageData?.students) return [];
    return pageData.students.map((st) => ({
      id: String(st.id),
      name: st.name || 'Student',
      joinedDate: st.joined_date || '14 May 2012',
      location: st.location || st.batch_name || 'Sathya Stadium',
      attendancePercent: st.attendance_percent || '0%',
      phone: st.phone || '',
      paymentStatus: st.payment_status === 'paid' ? 'paid' : 'overdue',
      amount: st.amount ? `₹${st.amount.toLocaleString()}` : '₹1,250',
      paidDate: st.paid_date || undefined,
      attendanceRatio: st.attendance_ratio || `${st.attended_count ?? 0}/${st.conducted_count ?? 0}`,
      attendanceRatioStatus: (st.attended_count ?? 0) >= (st.conducted_count ?? 0) * 0.75 ? 'success' : 'danger',
      avatar: st.avatar_uri || undefined,
    }));
  }, [pageData?.students]);

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
    let result = apiStudentsList.filter((s) => {
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
  }, [apiStudentsList, searchQuery, activeFilter, selectedSortId]);

  const {
    displayedItems: displayedStudents,
    hasMore: hasMoreStudents,
    onScroll: onIncrementalScroll,
  } = useIncrementalList({
    items: filteredStudents,
    pageSize: 10,
    isLoading: isPageLoading,
  });

  const handleBack = useCallback(() => {
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
  }, [onBackPress]);

  const handleCallStudent = useCallback((phone?: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${cleanPhone}`);
    }
  }, []);

  const handleOpenOptions = useCallback((student: StudentListItem) => {
    setSelectedStudent(student);
    setIsOptionsSheetVisible(true);
  }, []);

  const navigateToProfile = useCallback(
    (
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
            joinedDate: student.joinedDate || '14 May 2012',
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
              monthlyFee: student.amount || '₹1,250',
              pending: student.paymentStatus === 'paid' ? '₹0' : '₹1,250',
              status: student.paymentStatus === 'paid' ? 'PAID' : 'OVERDUE',
            },
          }),
        },
      } as any);
    },
    []
  );

  const handleStudentPress = useCallback(
    (student: StudentListItem) => {
      if (onStudentPress) {
        onStudentPress(student);
      } else {
        navigateToProfile(student, 'overview');
      }
    },
    [onStudentPress, navigateToProfile]
  );

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
          refetchPage();
          showToast('Student details updated successfully!', 'success');
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
          refetchPage();
          setIsAddStudentVisible(false);
        }}
      />
    );
  }

  const overview = pageData?.overview;

  return (
    <ScreenWrapper>
      {/* Toast Notification Banner */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

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
        refreshControl={
          <RefreshControl
            refreshing={isPageLoading}
            onRefresh={refetchPage}
            tintColor="#4186F7"
            colors={['#4186F7']}
          />
        }
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
        {isPageLoading && !pageData ? (
          <OverviewSkeleton />
        ) : (
          <AllStudentsStatCards
            totalStudents={overview?.total_students ?? 0}
            newThisMonth={overview?.new_this_month ?? 0}
            boysCount={overview?.boys_count ?? 0}
            boysPercent={overview?.boys_percent ?? 0}
            girlsCount={overview?.girls_count ?? 0}
            girlsPercent={overview?.girls_percent ?? 0}
            pendingFeesCount={overview?.pending_fees_count ?? 0}
          />
        )}

        {/* Student List Section */}
        <AllStudentsList
          students={displayedStudents}
          isLoading={isPageLoading}
          hasMore={hasMoreStudents}
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
              navigateToProfile(studentToView, 'overview');
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
          onCallParent={(st) => {
            const target = st || selectedStudent;
            setIsOptionsSheetVisible(false);
            setSelectedStudent(null);
            if (target?.phone) {
              handleCallStudent(target.phone);
            }
          }}
          onAttendanceHistory={(st) => {
            const target = st || selectedStudent;
            setIsOptionsSheetVisible(false);
            setSelectedStudent(null);
            if (target) {
              navigateToProfile(target, 'attendance');
            }
          }}
          onPaymentHistory={(st) => {
            const target = st || selectedStudent;
            setIsOptionsSheetVisible(false);
            setSelectedStudent(null);
            if (target) {
              navigateToProfile(target, 'payments');
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
        isLoading={deleteStudentMutation.isPending}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            const targetName = studentToDelete.name;
            deleteStudentMutation.mutate(studentToDelete.id, {
              onSuccess: () => {
                showToast(`${targetName} deleted successfully!`, 'delete');
                setStudentToDelete(null);
              },
              onError: () => {
                setStudentToDelete(null);
              },
            });
          }
        }}
      />
    </ScreenWrapper>
  );
}
