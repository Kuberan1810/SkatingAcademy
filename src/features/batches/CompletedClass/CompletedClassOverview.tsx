import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Trash } from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import FiltersTabs from '@/components/ui/FiltersTabs';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import CreateBatchScreen from '@/features/creation/BatchCreation/CreateBatchScreen';
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
  onDeleteBatchPress?: () => void;
  onEditBatchPress?: () => void;
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
  onDeleteBatchPress,
  onEditBatchPress,
}: CompletedClassOverviewProps) {
  // Hide tab bar while viewing completed class details
  const { hideTabBar, showTabBar } = useTabBarVisibility();

  const [currentBatchName, setCurrentBatchName] = useState(batchName);
  const [currentBatchTitle, setCurrentBatchTitle] = useState(batchTitle);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditBatchVisible, setIsEditBatchVisible] = useState(false);

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

  if (isEditBatchVisible) {
    return (
      <CreateBatchScreen
        mode="edit"
        initialValues={{
          batchName: currentBatchName,
          level: 'Basic',
          location: 'Sathya Stadium',
          classType: 'Weekend',
          trainingDays: 'Sat, Sun',
          startTime: '06:00 AM',
          endTime: '07:30 AM',
          monthlyFee: '₹1,250',
          yearlyFee: '₹1,250',
        }}
        onBackPress={() => setIsEditBatchVisible(false)}
        onSubmit={(data) => {
          if (data.batchName) {
            setCurrentBatchName(data.batchName);
            setCurrentBatchTitle(`${data.batchName} Students`);
          }
          setIsEditBatchVisible(false);
        }}
      />
    );
  }

  return (
    <ScreenWrapper>
      {/* Page Header */}
      <Header
        variant="page"
        title={currentBatchTitle}
        showBack={true}
        onBackPress={handleBack}
        rightIcon={<Trash size={20} color="#EF4444" variant="Linear" />}
        onRightPress={() => setIsDeleteModalVisible(true)}
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
          batchName={currentBatchName}
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

      {/* Delete Batch Confirmation Sheet */}
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Batch"
        itemName={currentBatchName}
        message={`Are you sure you want to remove ${currentBatchName}? All attendance history and enrolled students in this batch will be affected. This action cannot be undone.`}
        confirmText="Yes, Delete"
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={() => {
          setIsDeleteModalVisible(false);
          console.log('batch deleted:', currentBatchName);
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
