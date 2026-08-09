import React from 'react';
import { View } from 'react-native';
import FiltersTabs, { FilterItem } from '@/components/ui/FiltersTabs';
import { StudentProfileTabType } from '../types';

export interface StudentSegmentedTabsProps {
  activeTab: StudentProfileTabType;
  onSelectTab: (tab: StudentProfileTabType) => void;
}

const PROFILE_TABS: FilterItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'payments', label: 'Payments' },
];

export default function StudentSegmentedTabs({
  activeTab,
  onSelectTab,
}: StudentSegmentedTabsProps) {
  return (
    <View className="mb-5">
      <FiltersTabs
        tabs={PROFILE_TABS}
        activeTab={activeTab}
        onSelectTab={(tabId) => onSelectTab(tabId as StudentProfileTabType)}
        scrollable={false}
        tabClassName="flex-1"
        textClassName="text-[14px] font-urbanist-bold text-center"
      />
    </View>
  );
}
