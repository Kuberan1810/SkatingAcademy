import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Setting2 } from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import FiltersTabs from '@/components/ui/FiltersTabs';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';

import CompletedStudentCard, { CompletedStudentItem } from './CompletedStudentCard';
import CompletedClassStatCards from './CompletedClassStatCards';
import CompletedClassHeaderSection from './CompletedClassHeaderSection';

export interface CompletedClassOverviewProps {
  batchTitle?: string;
  batchName?: string;
  dateText?: string;
  subtitle?: string;
  totalCount?: number;
  presentCount?: number;
  absentCount?: number;
  students?: CompletedStudentItem[];
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const DEFAULT_STUDENTS: CompletedStudentItem[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    attendancePercent: '92% Attendance',
    status: 'present',
    attendanceRatio: '20/24',
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    attendancePercent: '92% Attendance',
    status: 'present',
  },
  {
    id: '3',
    name: 'Rahul Sharma',
    attendancePercent: '90% Attendance',
    status: 'absent',
  },
  {
    id: '4',
    name: 'Rahul Sharma',
    attendancePercent: '92% Attendance',
    status: 'absent',
    attendanceRatio: '20/24',
  },
  {
    id: '5',
    name: 'Rahul Sharma',
    attendancePercent: '95% Attendance',
    status: 'present',
    attendanceRatio: '22/24',
  },
];

export default function CompletedClassOverview({
  batchTitle = 'Sathya Stadium Students',
  batchName = 'Morning Batch (6:00 AM - 7:30 AM)',
  dateText = 'Today · Oct 24, 2023',
  subtitle = 'Track daily attendance for Sathya Stadium',
  totalCount = 90,
  presentCount = 86,
  absentCount = 4,
  students = DEFAULT_STUDENTS,
  onBackPress,
}: CompletedClassOverviewProps) {
  // Hide tab bar while viewing completed class details
  const { hideTabBar, showTabBar } = useTabBarVisibility();

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Present' && s.status === 'present') ||
        (activeFilter === 'Absent' && s.status === 'absent');

      return matchesSearch && matchesFilter;
    });
  }, [students, searchQuery, activeFilter]);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/batches' as any);
    }
  };

  return (
    <ScreenWrapper >
      {/* Page Header */}
      <Header
        variant="page"
        title={batchTitle}
        showBack={true}
        onBackPress={handleBack}
        rightIcon={Setting2}
        onRightPress={() => console.log('Settings pressed')}
      />
      {/* Search Input Bar */}
      <View className="mb-4 pt-1">
        <Search
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search student..."
          showFilter={false}
        />
      </View>
      <Animated.ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="always"
        bounces={true}
        alwaysBounceVertical={true}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >


        {/* Date Pill, Batch Name & Subtitle Section */}
        <CompletedClassHeaderSection
          dateText={dateText}
          batchName={batchName}
          subtitle={subtitle}
        />

        {/* Stat Cards: Total, Present, Absent */}
        <CompletedClassStatCards
          totalCount={totalCount}
          presentCount={presentCount}
          absentCount={absentCount}
        />

        {/* Student List Section Title & Filter Tabs */}
        <Text className="text-[20px] font-urbanist-bold text-primary tracking-tight mb-5">
          Student List
        </Text>

        <FiltersTabs
          tabs={['All', 'Present', 'Absent']}
          activeTab={activeFilter}
          onSelectTab={setActiveFilter}
          scrollable={false}
          containerClassName="mb-5"
        />

        {/* Student List Cards */}
        <View className="gap-4">
          {filteredStudents.map((s) => (
            <CompletedStudentCard key={s.id} student={s} />
          ))}
        </View>
      </Animated.ScrollView>
    </ScreenWrapper>
  );
}
