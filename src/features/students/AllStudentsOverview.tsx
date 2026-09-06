import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Linking, BackHandler, RefreshControl, TouchableOpacity } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Add, Diagram, Profile2User, Calendar, Trash } from 'iconsax-react-native';
import { X } from 'lucide-react-native';
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
import { StudentsPageSkeleton } from '@/components/ui/Skeleton';
import { useStudentsPage, useDeleteStudent, useBulkDeleteStudents } from '@/hooks/use-students';
import { useIncrementalList } from '@/hooks/use-incremental-list';
import { getErrorMessage } from '@/utils/error';

import AllStudentsStatCards from './AllStudentsStatCards';
import AllStudentsList from './AllStudentsList';
import styles from '@/styles/styles';

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
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();
  const { data: pageData, isLoading: isPageLoading, isRefetching, refetch: refetchPage } = useStudentsPage();
  const deleteStudentMutation = useDeleteStudent();
  const bulkDeleteMutation = useBulkDeleteStudents();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSortId, setSelectedSortId] = useState('attendance_high');
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null);
  const [isOptionsSheetVisible, setIsOptionsSheetVisible] = useState(false);
  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);

  // Bulk Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Toggle Tab Bar visibility based on selection mode
  useEffect(() => {
    if (isSelectionMode) {
      hideTabBar();
    } else {
      showTabBar();
    }
  }, [isSelectionMode, hideTabBar, showTabBar]);

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
  const apiStudentsList: (StudentListItem & { attVal: number })[] = useMemo(() => {
    if (!pageData?.students) return [];
    return pageData.students.map((st: any) => {
      const attPercent = st.attendance_percent || '0%';
      const attVal = parseFloat(attPercent.replace('%', '')) || 0;
      return {
        id: String(st.id),
        name: st.name || '',
        joinedDate: st.joined_date || '',
        location: st.location || st.batch_name || '',
        attendancePercent: attPercent,
        attVal,
        phone: st.phone || st.phone_number || '',
        paymentStatus: (st.payment_status || '').toLowerCase() === 'paid' ? 'paid' : 'overdue',
        amount: st.amount ? `₹${st.amount.toLocaleString()}` : (st.monthly_fee ? `₹${st.monthly_fee.toLocaleString()}` : ''),
        paidDate: st.paid_date || undefined,
        attendanceRatio: st.attendance_ratio || `${st.attended_count ?? 0}/${st.conducted_count ?? 0}`,
        attendanceRatioStatus: (st.attended_count ?? 0) >= (st.conducted_count ?? 0) * 0.75 ? 'success' : 'danger',
        gender: st.gender,
        dob: st.dob,
        bloodGroup: st.blood_group,
        address: st.address,
        parentName: st.parent_name,
        emergencyContact: st.emergency_contact,
      };
    });
  }, [pageData?.students]);

  // Filter students based on Active Filter Pill & Search Query
  const filteredStudents = useMemo(() => {
    let result = apiStudentsList;

    if (activeFilter === 'Paid') {
      result = result.filter((s) => s.paymentStatus === 'paid');
    } else if (activeFilter === 'Overdue') {
      result = result.filter((s) => s.paymentStatus === 'overdue');
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.phone || '').includes(q) ||
          (s.location || '').toLowerCase().includes(q)
      );
    }

    // Apply Sorting
    return [...result].sort((a, b) => {
      switch (selectedSortId) {
        case 'attendance_high':
          return b.attVal - a.attVal;
        case 'attendance_low':
          return a.attVal - b.attVal;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'recently_joined':
        default:
          return 0;
      }
    });
  }, [apiStudentsList, activeFilter, searchQuery, selectedSortId]);

  // Incremental pagination hook for smooth lazy scrolling
  const {
    displayedItems: displayedStudents,
    hasMore,
    onScroll: onIncrementalScroll,
  } = useIncrementalList({
    items: filteredStudents,
    pageSize: 20,
    isLoading: isPageLoading && !pageData,
  });

  const handleBack = useCallback(() => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      return;
    }
    if (onBackPress) {
      onBackPress();
    } else {
      try {
        if (router.canGoBack()) {
          router.back();
        }
      } catch (e) {
        // Suppress back navigation error
      }
    }
  }, [onBackPress, isSelectionMode]);

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
            joinedDate: student.joinedDate || '',
            location: student.location || '',
            attendancePercent: student.attendancePercent || '0%',
            parentInfo: {
              parentName: student.parentName || '',
              phone: student.phone || '',
              emergency: student.emergencyContact || '',
            },
            personalInfo: {
              gender: student.gender || '',
              dob: student.dob || '',
              bloodGroup: student.bloodGroup || '',
              address: student.address || '',
            },
            feeInfo: {
              monthlyFee: student.amount || '',
              dueDate: student.paidDate || '15th of every month',
              status: student.paymentStatus === 'paid' ? 'Paid' : 'Overdue',
            },
          }),
        },
      });
    },
    []
  );

  // Handle Long Press to activate Selection Mode
  const handleLongPressStudent = useCallback((student: StudentListItem) => {
    setIsSelectionMode(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(String(student.id));
      return next;
    });
  }, []);

  // Handle Card Click (Selection mode toggle vs Navigate)
  const handleStudentPress = useCallback(
    (student: StudentListItem) => {
      if (isSelectionMode) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          const stId = String(student.id);
          if (next.has(stId)) {
            next.delete(stId);
          } else {
            next.add(stId);
          }
          if (next.size === 0) {
            setIsSelectionMode(false);
          }
          return next;
        });
      } else if (onStudentPress) {
        onStudentPress(student);
      } else {
        navigateToProfile(student, 'overview');
      }
    },
    [isSelectionMode, onStudentPress, navigateToProfile]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredStudents.map((s) => String(s.id)));
      setSelectedIds(allIds);
    }
  }, [filteredStudents, selectedIds.size]);

  const handleCancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleOpenAddStudent = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    if (onAddStudentPress) {
      onAddStudentPress();
    } else {
      router.push('/(tabs)/students/add' as any);
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
          gender: studentToEdit.gender || '',
          dob: studentToEdit.dob || '',
          bloodGroup: studentToEdit.bloodGroup || '',
          batch: studentToEdit.location || '',
          joinDate: studentToEdit.joinedDate || '',
          parentName: studentToEdit.parentName || '',
          phoneNumber: studentToEdit.phone || '',
          emergencyContact: studentToEdit.emergencyContact || '',
          monthlyFee: studentToEdit.amount || '',
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
        title={isSelectionMode ? `${selectedIds.size} Selected` : "Students List"}
        showBack={true}
        onBackPress={handleBack}
        rightIcon={isSelectionMode ? undefined : Add}
        onRightPress={isSelectionMode ? undefined : handleOpenAddStudent}
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
            refreshing={isRefetching}
            onRefresh={refetchPage}
            tintColor="#4186F7"
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 140,
        }}
      >
        {isPageLoading && !pageData ? (
          <StudentsPageSkeleton />
        ) : (
          <>
            {/* Dynamic All Students Stat Cards */}
            <AllStudentsStatCards overview={overview} />

            {/* Dynamic Students Cards List */}
            <View className="mt-6">
              <AllStudentsList
                students={displayedStudents}
                isLoading={isPageLoading && !pageData}
                hasMore={hasMore}
                filterTabs={['All', 'Paid', 'Overdue']}
                activeFilter={activeFilter}
                isSelectionMode={isSelectionMode}
                selectedIds={selectedIds}
                onSelectFilter={(tab) => setActiveFilter(tab)}
                onStudentPress={handleStudentPress}
                onStudentLongPress={handleLongPressStudent}
                onCallPress={handleCallStudent}
                onMorePress={handleOpenOptions}
              />
            </View>
          </>
        )}
      </Animated.ScrollView>

      {/* Neat Flush Bottom Selection Bar (Sits at bottom edge replacing Navbar) */}
      {isSelectionMode && (
         <Animated.View
                  entering={SlideInDown.duration(200)}
                  exiting={SlideOutDown.duration(150)}
                  className="absolute bottom-0 left-0 right-0 z-[9999] bg-white border-t border-primary-border px-5 py-7 pb-7 flex-row items-center justify-between shadow-2xl"
                >
                  {/* Left: Close Button & Selected Count */}
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      style={ [styles.BlackInnerShadowStyle]}
                      activeOpacity={0.7}
                      onPress={handleCancelSelection}
                      className="w-12 h-12 rounded-full bg-white items-center justify-center border border-primary-border "
                    >
                      <X size={18} color="#475569" />
                    </TouchableOpacity>
        
                    <View>
                      <Text className="text-[15px] font-urbanist-bold text-primary tracking-tight">
                        {selectedIds.size} Selected
                      </Text>
                      <TouchableOpacity activeOpacity={0.7} onPress={handleSelectAll}>
                        <Text className="text-[13px] font-urbanist-bold text-[#4186F7]">
                          {selectedIds.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
        
                  {/* Right: Red Delete Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={ [styles.InnerShadowStyle]}
                    onPress={() => {
                      if (selectedIds.size > 0) {
                        setIsBulkDeleteModalOpen(true);
                      }
                    }}
                    disabled={selectedIds.size === 0}
                    className={`px-6 py-4 rounded-full flex-row items-center gap-2 ${
                      selectedIds.size > 0 ? 'bg-[#EF4444]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <Trash size={18} color="#FFFFFF" variant="Bold" />
                    <Text className="text-[14px] font-urbanist-bold text-white">
                      Delete ({selectedIds.size})
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
      )}

      {/* Options Bottom Sheet */}
      {selectedStudent && (
        <StudentOptionsBottomSheet
          visible={isOptionsSheetVisible}
          student={selectedStudent}
          studentName={selectedStudent.name}
          onClose={() => setIsOptionsSheetVisible(false)}
          onViewProfile={() => {
            setIsOptionsSheetVisible(false);
            navigateToProfile(selectedStudent, 'overview');
          }}
          onViewAttendance={() => {
            setIsOptionsSheetVisible(false);
            navigateToProfile(selectedStudent, 'attendance');
          }}
          onAttendanceHistory={() => {
            setIsOptionsSheetVisible(false);
            navigateToProfile(selectedStudent, 'attendance');
          }}
          onViewPayments={() => {
            setIsOptionsSheetVisible(false);
            navigateToProfile(selectedStudent, 'payments');
          }}
          onPaymentHistory={() => {
            setIsOptionsSheetVisible(false);
            navigateToProfile(selectedStudent, 'payments');
          }}
          onCallParent={() => {
            setIsOptionsSheetVisible(false);
            handleCallStudent(selectedStudent.phone);
          }}
          onEditStudent={() => {
            setIsOptionsSheetVisible(false);
            const targetStudent = selectedStudent;
            setTimeout(() => {
              setStudentToEdit(targetStudent);
            }, 250);
          }}
          onDeleteStudent={() => {
            setIsOptionsSheetVisible(false);
            const studentTarget = selectedStudent;
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

      {/* Single Student Delete Confirmation Modal */}
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

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={isBulkDeleteModalOpen}
        itemName={`${selectedIds.size} Selected Students`}
        isLoading={bulkDeleteMutation.isPending}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={() => {
          const idsArray = Array.from(selectedIds);
          bulkDeleteMutation.mutate(idsArray, {
            onSuccess: () => {
              showToast(`${idsArray.length} Students deleted successfully!`, 'delete');
              setIsBulkDeleteModalOpen(false);
              setIsSelectionMode(false);
              setSelectedIds(new Set());
            },
            onError: (err) => {
              setIsBulkDeleteModalOpen(false);
              const msg = getErrorMessage(err, 'Failed to bulk delete students');
              showToast(msg, 'error');
            },
          });
        }}
      />
    </ScreenWrapper>
  );
}
