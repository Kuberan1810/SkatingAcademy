import React, { useState } from 'react';
import Animated from 'react-native-reanimated';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Overview from '@/features/dashboard/Overview';
import BatchList from '@/features/batches/BatchList';
import SortBottomSheet, { SortOptionItem } from '@/components/ui/SortBottomSheet';
import { router } from 'expo-router';
import { Add, Setting2 } from 'iconsax-react-native';

import { useTabBarVisibility } from '@/context/tab-bar-visibility';

const SORT_OPTIONS: SortOptionItem[] = [
  { id: 'recent', label: 'Recently Added' },
  { id: 'name_asc', label: 'Batch Name', subtitle: 'A to Z' },
  { id: 'name_desc', label: 'Batch Name', subtitle: 'Z to A' },
  { id: 'most_students', label: 'Most Students' },
  { id: 'least_students', label: 'Least Students' },
];

export default function BatchesScreen() {
  const { handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [isSortVisible, setIsSortVisible] = useState(false);

  return (
    <ScreenWrapper>
      <Header
        variant="page"
        title="Batches"
        onBackPress={() => router.back()}
        rightIcon={Add}
        onRightPress={() => router.push('/(tabs)/batches/add' as any)}
      />
      <Search
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search students, batches..."
        showFilter={true}
        onFilterPress={() => setIsSortVisible(true)}
      />

      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        keyboardShouldPersistTaps="handled"
        scrollsToTop={true}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 140,
        }}
      >
        <Overview />
        <BatchList
          searchQuery={searchQuery}
          sortBy={sortBy}
          onBatchPress={(item) => {
            router.push({
              pathname: '/(tabs)/batches/StudentListScreen',
              params: { title: item.title, from: 'batches' },
            } as any);
          }}
          onStartPress={(item) => {
            router.push({
              pathname: '/(tabs)/batches/start-class',
              params: { title: item.title, from: 'batches' },
            } as any);
          }}
          onAttendancePress={(item) => {
            router.push({
              pathname: '/(tabs)/batches/completed-class',
              params: { title: item.title, from: 'batches' },
            } as any);
          }}
          onEditBatch={(item) => {
            router.push({
              pathname: '/(tabs)/batches/add',
              params: {
                mode: 'edit',
                batchName: item.title,
                level: 'Basic',
                location: 'Sathya Stadium',
              },
            } as any);
          }}
          onDeleteBatch={(item) => console.log('Deleted batch:', item.title)}
          onMorePress={(item) => console.log('More options for:', item.title)}
        />
      </Animated.ScrollView>

      <SortBottomSheet
        visible={isSortVisible}
        options={SORT_OPTIONS}
        selectedOptionId={sortBy}
        onSelectOption={(id) => {
          setSortBy(id);
          setIsSortVisible(false);
        }}
        onClose={() => setIsSortVisible(false)}
      />
    </ScreenWrapper>
  );
}
