import React from 'react';
import { View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import FiltersTabs from '@/components/ui/FiltersTabs';
import StudentCard, { StudentListItem } from '@/features/batches/StudentListScreen/StudentCard';

export interface AllStudentsListProps {
  students: StudentListItem[];
  filterTabs?: string[];
  activeFilter?: string;
  onSelectFilter?: (tab: string) => void;
  onStudentPress?: (student: StudentListItem) => void;
  onCallPress?: (phone?: string) => void;
  onMorePress?: (student: StudentListItem) => void;
}

export default function AllStudentsList({
  students,
  filterTabs = ['All', 'Paid', 'Overdue'],
  activeFilter = 'All',
  onSelectFilter,
  onStudentPress,
  onCallPress,
  onMorePress,
}: AllStudentsListProps) {
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
        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            // onPress={(s) => {
            //   try {
            //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            //   } catch (e) {}
            //   onStudentPress?.(s);
            // }}
            // onCallPress={(phone) => {
            //   try {
            //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            //   } catch (e) {}
            //   onCallPress?.(phone);
            // }}
            onMorePress={(s) => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch (e) {}
              onMorePress?.(s);
            }}
          />
        ))}
      </View>
    </View>
  );
}
