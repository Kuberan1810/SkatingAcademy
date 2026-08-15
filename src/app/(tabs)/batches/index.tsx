import React, { useState } from 'react';
import { RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Overview from '@/features/dashboard/Overview';
import BatchList from '@/features/batches/BatchList';
import SortBottomSheet, { SortOptionItem } from '@/components/ui/SortBottomSheet';
import Toast from '@/components/ui/Toast';
import { router } from 'expo-router';
import { Add } from 'iconsax-react-native';

import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import { useBatchesPage } from '@/hooks/use-batches';
import { useStartSession } from '@/hooks/use-sessions';
import { getErrorMessage } from '@/utils/error';

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
  const [startingBatchId, setStartingBatchId] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'delete' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'error',
  });

  const showToast = (message: string, type: 'success' | 'delete' | 'error' = 'error') => {
    setToast({ visible: true, message, type });
  };

  // Fetch live Batches Page data (GET /api/v1/batches-page)
  const { data: pageData, isLoading, isRefetching, refetch } = useBatchesPage();
  const startSessionMutation = useStartSession();

  const handleStartClass = (item: any) => {
    const batchIdNum = Number(item.id);
    setStartingBatchId(String(item.id));

    if (!isNaN(batchIdNum) && batchIdNum > 0) {
      startSessionMutation.mutate(
        { batch_id: batchIdNum },
        {
          onSuccess: (sessionData) => {
            setStartingBatchId(null);
            router.push({
              pathname: '/(tabs)/batches/start-class',
              params: {
                batchId: item.id,
                title: item.title,
                sessionId: sessionData?.id ? String(sessionData.id) : undefined,
                sessionData: JSON.stringify(sessionData),
                from: 'batches',
              },
            } as any);
          },
          onError: (err) => {
            setStartingBatchId(null);
            const msg = getErrorMessage(err, 'Failed to start class session');
            showToast(msg, 'error');
          },
        }
      );
    } else {
      setStartingBatchId(null);
      router.push({
        pathname: '/(tabs)/batches/start-class',
        params: { title: item.title, from: 'batches' },
      } as any);
    }
  };

  return (
    <ScreenWrapper>
      {/* Toast Notification Banner */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
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
        {/* Dynamic Overview Dashboard Cards */}
        <Overview
          overview={pageData?.overview}
          isLoading={isLoading}
        />

        {/* Dynamic Batches Cards List */}
        <BatchList
          batches={pageData?.batches ?? []}
          isLoading={isLoading}
          loadingBatchId={startingBatchId}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onBatchPress={(item) => {
            router.push({
              pathname: '/(tabs)/batches/StudentListScreen',
              params: { title: item.title, from: 'batches' },
            } as any);
          }}
          onStartPress={handleStartClass}
          onAttendancePress={(item) => {
            router.push({
              pathname: '/(tabs)/batches/completed-class',
              params: {
                title: item.title,
                sessionId: (item as any).sessionId || (item as any).session_id || item.id,
                from: 'batches',
              },
            } as any);
          }}
          onEditBatch={(item) => {
            router.push({
              pathname: '/(tabs)/batches/add',
              params: {
                mode: 'edit',
                batchId: item.id,
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
