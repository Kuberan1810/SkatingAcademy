import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { User } from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import FiltersTabs from '@/components/ui/FiltersTabs';
import StudentCard, { StudentListItem } from '@/features/batches/StudentListScreen/StudentCard';
import { StudentCardSkeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import styles from '@/styles/styles';

export interface AllStudentsListProps {
  students: StudentListItem[];
  isLoading?: boolean;
  hasMore?: boolean;
  filterTabs?: string[];
  activeFilter?: string;
  isSelectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelectFilter?: (tab: string) => void;
  onStudentPress?: (student: StudentListItem) => void;
  onStudentLongPress?: (student: StudentListItem) => void;
  onCallPress?: (phone?: string) => void;
  onMorePress?: (student: StudentListItem) => void;
}

function AllStudentsList({
  students,
  isLoading = false,
  hasMore = false,
  filterTabs = ['All', 'Paid', 'Overdue'],
  activeFilter = 'All',
  isSelectionMode = false,
  selectedIds = new Set(),
  onSelectFilter,
  onStudentPress,
  onStudentLongPress,
  onCallPress,
  onMorePress,
}: AllStudentsListProps) {
  const handlePress = useCallback(
    (student: StudentListItem) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      onStudentPress?.(student);
    },
    [onStudentPress]
  );

  const handleLongPress = useCallback(
    (student: StudentListItem) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (e) {}
      onStudentLongPress?.(student);
    },
    [onStudentLongPress]
  );

  const handleCall = useCallback(
    (phone?: string) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      onCallPress?.(phone);
    },
    [onCallPress]
  );

  const handleMore = useCallback(
    (student: StudentListItem) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
      onMorePress?.(student);
    },
    [onMorePress]
  );

  return (
    <View className="w-full">
      {/* Section Header */}
      <Text className="text-[20px] font-urbanist-bold text-primary tracking-tight mb-3">
        Student List
      </Text>

      {/* Filter Tabs */}
      {filterTabs && filterTabs.length > 0 && (
        <View className="mb-4">
          <FiltersTabs
            tabs={filterTabs}
            activeTab={activeFilter}
            onSelectTab={(tab) => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (e) {}
              onSelectFilter?.(tab);
            }}
            scrollable={false}
          />
        </View>
      )}

      {/* List Container */}
      <View className="gap-3.5">
        {isLoading && students.length === 0 ? (
          <SkeletonGroup>
            <StudentCardSkeleton />
            <StudentCardSkeleton />
            <StudentCardSkeleton />
          </SkeletonGroup>
        ) : students.length > 0 ? (
          <>
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(String(student.id))}
                onPress={handlePress}
                onLongPress={handleLongPress}
                onCallPress={handleCall}
                onMorePress={handleMore}
              />
            ))}
            {hasMore && (
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
              No students found
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary mt-1 text-center">
              There are no students matching your search or selected filter.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default React.memo(AllStudentsList);
