import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import SortBottomSheet, { SortOptionItem } from '@/components/ui/SortBottomSheet';
import StudentOptionsBottomSheet from '@/components/ui/StudentOptionsBottomSheet';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import ExportReportModal, { ExportFilterValues } from '@/components/ui/ExportReportModal';
import Toast from '@/components/ui/Toast';
import styles from '@/styles/styles';
import { router } from 'expo-router';
import { User, Trash, ExportSquare } from 'iconsax-react-native';
import { X } from 'lucide-react-native';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Text, View, BackHandler, Linking, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import ScreenWrapper from '@/components/screen-wrapper';
import FiltersTabs from '@/components/ui/FiltersTabs';
import StudentCard, { StudentListItem } from './StudentCard';
import StudentStatCards from './StudentStatCards';
import AddStudentScreen from '@/features/creation/studentCreation/AddStudentScreen';
import { useTabBarVisibility } from '@/context/tab-bar-visibility'; 
import { useDeleteStudent, useBulkDeleteStudents } from '@/hooks/use-students';
import { useIncrementalList } from '@/hooks/use-incremental-list';
import { useBatchStudents, useDeleteBatch } from '@/hooks/use-batches';
import { useExportStudentReport } from '@/hooks/use-reports';
import { StudentCardSkeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { getErrorMessage } from '@/utils/error';

const SORT_OPTIONS: SortOptionItem[] = [
  { id: 'attendance_high', label: 'Attendance: High to Low', directionText: 'High to low', isAscending: false },
  { id: 'attendance_low', label: 'Attendance: Low to High', directionText: 'Low to high', isAscending: true },
  { id: 'name_asc', label: 'Name: A to Z', directionText: 'A to Z', isAscending: true },
  { id: 'name_desc', label: 'Name: Z to A', directionText: 'Z to A', isAscending: false },
  { id: 'recently_joined', label: 'Recently Joined', directionText: 'Newest first', isAscending: true },
];

export interface StudentListOverviewProps {
  batchId?: number | string;
  batchName?: string;
  batchTitle?: string;
  batchSubtitle?: string;
  totalStudents?: string | number;
  avgAttendance?: string;
  students?: StudentListItem[];
  onBackPress?: () => void;
  onEditBatchPress?: () => void;
  onDeleteBatchPress?: () => void;
  onStudentPress?: (student: StudentListItem) => void;
}

export default function StudentListOverview({
  batchId = 5,
  batchName: propBatchName,
  batchTitle: propBatchTitle,
  batchSubtitle: propBatchSubtitle,
  totalStudents: propTotalStudents,
  avgAttendance: propAvgAttendance,
  students: propStudents,
  onBackPress,
  onEditBatchPress,
  onDeleteBatchPress,
  onStudentPress,
}: StudentListOverviewProps) {
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();
  const deleteStudentMutation = useDeleteStudent();
  const bulkDeleteMutation = useBulkDeleteStudents();
  const deleteBatchMutation = useDeleteBatch();

  const {
    data: batchData,
    isLoading: isBatchLoading,
    isRefetching,
    refetch: refetchBatchStudents,
  } = useBatchStudents(batchId);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSortId, setSelectedSortId] = useState('attendance_high');
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<StudentListItem | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null);
  const [isOptionsSheetVisible, setIsOptionsSheetVisible] = useState(false);
  const [isDeleteBatchModalVisible, setIsDeleteBatchModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);

  const exportStudentReportMutation = useExportStudentReport();

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

  // Map API batch_details & students array to StudentListItem with instant memoization
  const apiStudentsList: (StudentListItem & { attVal: number })[] = useMemo(() => {
    const list = batchData?.students || propStudents || [];
    if (!list.length) return [];
    return list.map((st: any) => {
      const rawAtt = st.attendance_percent || st.attendancePercent || '0%';
      const attVal = typeof rawAtt === 'number' ? rawAtt : (parseFloat(String(rawAtt).replace('%', '')) || 0);
      const attendedCount = st.attended_count ?? 0;
      const conductedCount = st.conducted_count ?? 0;
      const paymentStatus = (st.payment_status || st.paymentStatus || '').toLowerCase() === 'paid' ? 'paid' : 'overdue';
      return {
        id: String(st.id),
        name: st.name || st.full_name || '',
        joinedDate: st.joined_date || st.joinedDate || '',
        location: st.location || st.batch_name || propBatchName || '',
        attendancePercent: String(rawAtt),
        attVal,
        phone: st.phone || st.phone_number || '',
        paymentStatus,
        amount: st.amount ? `₹${st.amount.toLocaleString()}` : (st.monthly_fee ? `₹${st.monthly_fee.toLocaleString()}` : ''),
        paidDate: st.paid_date || st.paidDate || undefined,
        attendanceRatio: st.attendance_ratio || st.attendanceRatio || `${attendedCount}/${conductedCount}`,
        attendanceRatioStatus: conductedCount > 0 ? (attendedCount >= conductedCount * 0.75 ? 'success' : 'danger') : 'success',
        gender: st.gender,
        dob: st.dob,
        bloodGroup: st.blood_group || st.bloodGroup,
        address: st.address,
        parentName: st.parent_name || st.parentName,
        emergencyContact: st.emergency_contact || st.emergencyContact,
      };
    });
  }, [batchData?.students, propStudents, propBatchName]);

  // Filter students based on Search Query, Active Filter, and Sorting
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

    return [...result].sort((a, b) => {
      if (selectedSortId === 'attendance_high') {
        return b.attVal - a.attVal;
      }
      if (selectedSortId === 'attendance_low') {
        return a.attVal - b.attVal;
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
    pageSize: 25,
  });

  const handleBack = () => {
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
  };

  const handleOpenOptions = (student: StudentListItem) => {
    setSelectedStudent(student);
    setIsOptionsSheetVisible(true);
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
            status: student.paymentStatus === 'paid' ? 'PAID' : 'OVERDUE',
          },
          attendanceStats: {
            present: 0,
            absent: 0,
            attendancePercent: student.attendancePercent || '0%',
            scheduledDaysCount: 0,
          },
        }),
      },
    } as any);
  };

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
    [isSelectionMode, onStudentPress]
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
          refetchBatchStudents();
          showToast('Student details updated successfully!', 'success');
          setStudentToEdit(null);
        }}
      />
    );
  }

  const handleExportReport = async (
    filters: ExportFilterValues,
    actionType: 'download' | 'share' = 'download'
  ) => {
    try {
      const result = await exportStudentReportMutation.mutateAsync({
        batch_id: batchId,
        fee_status: filters.feeStatus !== 'all' ? filters.feeStatus : undefined,
        status: filters.studentStatus !== 'all' ? filters.studentStatus : undefined,
        month: filters.month ?? undefined,
        year: filters.year ?? undefined,
        format: filters.format,
        batchName: batchSubtitleText || batchTitleText,
        actionType,
      });
      showToast(
        result.message ||
          (actionType === 'share'
            ? 'Report shared successfully!'
            : `Student report (${filters.format.toUpperCase()}) downloaded successfully!`),
        'success'
      );
      setIsExportModalVisible(false);
    } catch (err: any) {
      showToast(getErrorMessage(err) || 'Failed to export student report', 'error');
    }
  };

  const batchDetails = batchData?.batch_details;
  const batchTitleText = batchDetails?.batch_title || propBatchTitle || propBatchName || 'Batch Students';
  const batchSubtitleText = batchDetails?.batch_name || propBatchSubtitle || '';
  const totalStudentsVal = batchDetails?.total_students ?? propTotalStudents ?? '0 Students';
  const avgAttendanceVal = batchDetails?.avg_attendance ?? propAvgAttendance ?? '0%';

  return (
    <ScreenWrapper>
      {/* Toast Notification Banner */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header Bar with Export Button in place of Settings */}
      <Header
        variant="page"
        title={isSelectionMode ? `${selectedIds.size} Selected` : batchTitleText}
        showBack={true}
        onBackPress={handleBack}
        rightIcon={isSelectionMode ? undefined : ExportSquare}
        onRightPress={isSelectionMode ? undefined : () => setIsExportModalVisible(true)}
      />

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
            onRefresh={refetchBatchStudents}
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
        {/* Batch Title Header */}
        <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight mb-1">
          {batchSubtitleText}
        </Text>

        {/* Batch Subtitle / Details Pill */}
        {batchSubtitleText ? (
          <Text className="text-[15px] font-urbanist-medium text-secondary tracking-tight mb-5">
            View, manage, and track student information
          </Text>
        ) : null}

        {/* Reusable Stat Cards Row */}
        <StudentStatCards
          totalStudents={totalStudentsVal}
          avgAttendance={avgAttendanceVal}
          className="mb-6"
        />

        {/* Student List Section Title */}
        <View className="flex-col gap-4 mb-5">
          <Text className="text-[22px] font-urbanist-bold text-primary tracking-tight">
            Student List
          </Text>
          {/* Dynamic Filter Tabs Pill Header */}
          <FiltersTabs
            tabs={['All', 'Paid', 'Overdue']}
            activeTab={activeFilter}
            onSelectTab={setActiveFilter}
            scrollable={false}
          />
        </View>

        {/* Student Cards List */}
        <View className="gap-4">
          {isBatchLoading && !batchData && (!propStudents || propStudents.length === 0) ? (
            <SkeletonGroup>
              <StudentCardSkeleton />
              <StudentCardSkeleton />
              <StudentCardSkeleton />
            </SkeletonGroup>
          ) : filteredStudents.length > 0 ? (
            <>
              {displayedStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.has(String(student.id))}
                  onPress={handleStudentPress}
                  onLongPress={handleLongPressStudent}
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
            if (selectedStudent.phone) {
              const cleanPhone = selectedStudent.phone.replace(/[^0-9+]/g, '');
              Linking.openURL(`tel:${cleanPhone}`);
            }
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

      {/* Sort Bottom Sheet */}
      <SortBottomSheet
        visible={isSortSheetVisible}
        title="Sort & Filter Students"
        options={SORT_OPTIONS}
        selectedOptionId={selectedSortId}
        onSelectOption={(id) => setSelectedSortId(id)}
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
                refetchBatchStudents();
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
              refetchBatchStudents();
            },
            onError: (err) => {
              setIsBulkDeleteModalOpen(false);
              const msg = getErrorMessage(err, 'Failed to bulk delete students');
              showToast(msg, 'error');
            },
          });
        }}
      />

      {/* Delete Batch Confirmation Modal */}
      <DeleteConfirmationModal
        visible={isDeleteBatchModalVisible}
        itemName={batchTitleText}
        isLoading={deleteBatchMutation.isPending}
        onClose={() => setIsDeleteBatchModalVisible(false)}
        onConfirm={() => {
          const bIdNum = Number(batchId);
          if (!isNaN(bIdNum)) {
            deleteBatchMutation.mutate(bIdNum, {
              onSuccess: () => {
                setIsDeleteBatchModalVisible(false);
                if (onDeleteBatchPress) {
                  onDeleteBatchPress();
                } else if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/batches' as any);
                }
              },
              onError: () => {
                setIsDeleteBatchModalVisible(false);
                showToast('Failed to delete batch', 'error');
              },
            });
          }
        }}
      />
      {/* Export Student Report Modal */}
      <ExportReportModal
        visible={isExportModalVisible}
        batchId={batchId}
        batchName={batchSubtitleText || batchTitleText}
        isLoading={exportStudentReportMutation.isPending}
        onClose={() => setIsExportModalVisible(false)}
        onExport={handleExportReport}
      />
    </ScreenWrapper>
  );
}
