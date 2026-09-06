import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Pressable,
} from 'react-native';
import {
  ArrowLeft,
  SearchNormal1,
  CloseCircle,
  Profile2User,
  Calendar,
  Card,
  Layer,
  ArrowRight2,
} from 'iconsax-react-native';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import { useGlobalSearch } from '@/hooks/use-global-search';
import { useStartSession } from '@/hooks/use-sessions';
import { GlobalSearchResultItem } from '@/api/search.api';
import StudentAvatar from '@/components/ui/StudentAvatar';
import styles, { COLORS } from '@/styles/styles';
import GoBack from '@/components/ui/GoBack';
import Toast from '@/components/ui/Toast';
import { getErrorMessage } from '@/utils/error';
import { X } from 'lucide-react-native';

export function getResultBadgeConfig(type: string) {
  const cleanType = (type || '').toLowerCase();
  switch (cleanType) {
    case 'student':
      return {
        label: 'Student',
        bg: '#EFF6FF',
        activeBg: '#F1F1F1',
        text: '#2563EB',
        icon: Profile2User,
      };
    case 'batch':
      return {
        label: 'Batch',
        bg: '#F3E8FF',
        activeBg: '#F1F1F1',
        text: '#7C3AED',
        icon: Layer,
      };
    case 'payment':
    case 'fee':
    case 'pending_fee':
      return {
        label: 'Payment',
        bg: '#FEF3C7',
        activeBg: '#F1F1F1',
        text: '#D97706',
        icon: Card,
      };
    case 'session':
      return {
        label: 'Session',
        bg: '#ECFDF5',
        activeBg: '#F1F1F1',
        text: '#02763D',
        icon: Calendar,
      };
    default:
      return {
        label: type || 'Result',
        bg: '#F1F5F9',
        activeBg: '#CBD5E1',
        text: '#475569',
        icon: SearchNormal1,
      };
  }
}

export default function SearchScreen() {
  const { hideTabBar, showTabBar, handleScroll } = useTabBarVisibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [startingItemId, setStartingItemId] = useState<string | null>(null);

  const { data: searchData, isLoading } = useGlobalSearch(searchQuery);
  const startSessionMutation = useStartSession();

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info' | 'delete';
  }>({
    visible: false,
    message: '',
    type: 'error',
  });

  const results = searchData?.results || [];

  // Manage tab bar visibility for dedicated search page
  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, [hideTabBar, showTabBar]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/dashboard/index' as any);
    }
  }, []);

  // Handle hardware back press on Android
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [handleBack]);

  // Group items into categories
  const grouped = useMemo(() => {
    const students: GlobalSearchResultItem[] = [];
    const batches: GlobalSearchResultItem[] = [];
    const payments: GlobalSearchResultItem[] = [];
    const others: GlobalSearchResultItem[] = [];

    results.forEach((item) => {
      const t = (item.type || '').toLowerCase();
      if (t === 'student') students.push(item);
      else if (t === 'batch') batches.push(item);
      else if (t === 'payment' || t === 'fee' || t === 'pending_fee') payments.push(item);
      else others.push(item);
    });

    return [
      { title: 'STUDENTS & PEOPLE', data: students },
      { title: 'BATCHES & CLASSES', data: batches },
      { title: 'PAYMENTS & FEES', data: payments },
      { title: 'OTHERS', data: others },
    ].filter((g) => g.data.length > 0);
  }, [results]);

  const handleSelectResult = (item: GlobalSearchResultItem) => {
    const cleanType = (item.type || '').toLowerCase();

    switch (cleanType) {
      case 'student':
        const sId = item.student_id ? String(item.student_id) : item.id;
        router.push({
          pathname: '/(tabs)/students/[id]',
          params: { id: sId, initialTab: 'overview' },
        });
        break;
      case 'payment':
      case 'fee':
      case 'pending_fee':
        const paymentStudentId = item.student_id ? String(item.student_id) : item.id;
        router.push({
          pathname: '/(tabs)/students/[id]',
          params: { id: paymentStudentId, initialTab: 'payments' },
        });
        break;
      case 'batch':
        const bId = item.batch_id ? String(item.batch_id) : item.id;
        router.push({
          pathname: '/(tabs)/batches/StudentListScreen' as any,
          params: { batchId: bId },
        });
        break;
      case 'session':
        const metaUpper = (item.meta || '').toUpperCase();
        const isLiveSession =
          metaUpper.includes('LIVE') || metaUpper.includes('START') || metaUpper.includes('UPCOMING');

        if (isLiveSession) {
          const batchIdNum = Number(item.batch_id || item.id);
          if (!isNaN(batchIdNum) && batchIdNum > 0) {
            setStartingItemId(item.id);
            startSessionMutation.mutate(
              { batch_id: batchIdNum },
              {
                onSuccess: (sessionData) => {
                  setStartingItemId(null);
                  router.push({
                    pathname: '/(tabs)/dashboard/start-class',
                    params: {
                      batchId: String(batchIdNum),
                      title: item.title,
                      sessionId: sessionData?.id ? String(sessionData.id) : undefined,
                      sessionData: JSON.stringify(sessionData),
                      from: 'search',
                    },
                  } as any);
                },
                onError: (err) => {
                  setStartingItemId(null);
                  const msg = getErrorMessage(err, 'Failed to start class session');
                  setToast({ visible: true, message: msg, type: 'error' });
                },
              }
            );
          } else {
            router.push({
              pathname: '/(tabs)/dashboard/start-class' as any,
              params: { sessionId: item.id, title: item.title, from: 'search' },
            });
          }
        } else {
          router.push({
            pathname: '/(tabs)/dashboard/completed-class' as any,
            params: { sessionId: item.id },
          });
        }
        break;
      default:
        break;
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

      {/* Top Header matching App Design Tokens & Height Alignment */}
      <View className="flex-row items-center px-5 py-3 border-b border-primary-border gap-3 bg-white">
        <GoBack onPress={handleBack} />

        {/* Pill Search Input with App Inset Shadow */}
        <View className="flex-1 flex-row items-center bg-white border border-primary-border rounded-full px-4 h-[44px] shadow-[inset_4px_4px_4px_rgba(0,0,0,0.05),_inset_-4px_-4px_4px_rgba(0,0,0,0.05)] gap-2.5">
          <SearchNormal1 size={20} color="#8A8A8E" variant="Linear" />
          <TextInput
            autoFocus={true}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search students, batches, payments..."
            placeholderTextColor="#8A8A8E"
            className="flex-1 text-[15px] font-urbanist-medium text-primary p-0"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSearchQuery('')}>
              <X size={20} color="#8A8A8E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Page Scroll Body */}
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        {searchQuery.trim().length < 2 ? (
          /* Clean Initial Prompt Centered Vertically */
          <View className="flex-1 items-center justify-center min-h-[380px] my-auto px-6">
            <View style={styles.IconStyle} className="p-3.5 mb-3">
              <SearchNormal1 size={24} color="#8A8A8E" variant="Linear" />
            </View>
            <Text className="text-[18px] font-urbanist-bold text-primary tracking-tight text-center">
              Search Academy Records
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary text-center mt-1.5 max-w-[280px]">
              Type at least 2 characters to search students, batches, or payment records.
            </Text>
          </View>
        ) : isLoading && results.length === 0 ? (
          /* Loading State Centered Vertically */
          <View className="flex-1 items-center justify-center min-h-[380px] my-auto gap-3">
            <ActivityIndicator size="large" color="#4186F7" />
            <Text className="text-[14px] font-urbanist-medium text-secondary">
              Searching records...
            </Text>
          </View>
        ) : results.length === 0 ? (
          /* Empty Search State Centered Vertically */
          <View className="flex-1 items-center justify-center min-h-[380px] my-auto px-6">
            <View style={styles.IconStyle} className="p-3.5 mb-3">
              <SearchNormal1 size={32} color="#8A8A8E" variant="Linear" />
            </View>
            <Text className="text-[18px] font-urbanist-bold text-primary tracking-tight text-center">
              No Results Found
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-secondary text-center mt-1.5 max-w-[280px]">
              We couldn't find any record matching "{searchQuery}".
            </Text>
          </View>
        ) : (
          /* Full Page Grouped List */
          <View className="pt-2">
            <View className="px-5 py-2.5 flex-row items-center justify-between bg-[#FDFDFD] border-b border-primary-border">
              <Text className="text-[12px] font-urbanist-bold text-secondary uppercase tracking-wider">
                Search Results ({results.length})
              </Text>
              {isLoading && <ActivityIndicator size="small" color="#4186F7" />}
            </View>

            {grouped.map((group) => (
              <View key={group.title} className="pt-1">
                {/* Category Section Header */}
                <View className="px-5 py-2 bg-[#FDFDFD] border-y border-primary-border">
                  <Text className="text-[11px] font-urbanist-bold text-light uppercase tracking-widest">
                    {group.title} ({group.data.length})
                  </Text>
                </View>

                {/* Clean Item Rows with High-Contrast Active Press Colors & Android Ripple */}
                {group.data.map((item, idx) => {
                  const badge = getResultBadgeConfig(item.type);
                  const IconComponent = badge.icon;
                  const isStudent = item.type.toLowerCase() === 'student';
                  const isLast = idx === group.data.length - 1;
                  const isItemStarting = startingItemId === item.id;

                  return (
                    <Pressable
                      key={`${item.type}-${item.id}`}
                      onPress={() => handleSelectResult(item)}
                      android_ripple={{ color: badge.activeBg }}
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? badge.activeBg : '#FFFFFF',
                      })}
                      className={`flex-row items-center justify-between px-5 py-4 ${
                        !isLast ? 'border-b border-primary-border' : ''
                      }`}
                    >
                      {/* Left: Round Avatar / Icon */}
                      <View className="flex-row items-center flex-1 mr-3 gap-3.5">
                        {isStudent ? (
                          <StudentAvatar
                            name={item.title}
                            avatarUri={item.image}
                            size={46}
                          />
                        ) : (
                          <View
                            style={{ backgroundColor: badge.bg }}
                            className="w-[46px] h-[46px] rounded-full items-center justify-center"
                          >
                            <IconComponent size={22} color={badge.text} variant="Linear" />
                          </View>
                        )}

                        {/* Title & Subtitle */}
                        <View className="flex-1 justify-center">
                          <Text
                            numberOfLines={1}
                            className="text-[16px] font-urbanist-semibold text-primary tracking-tight"
                          >
                            {item.title}
                          </Text>
                          {item.subtitle ? (
                            <Text
                              numberOfLines={1}
                              className="text-[13px] font-urbanist-medium text-secondary mt-0.5"
                            >
                              {item.subtitle}
                            </Text>
                          ) : null}
                          {item.meta ? (
                            <Text
                              numberOfLines={1}
                              className="text-[12px] font-urbanist-medium text-light mt-0.5"
                            >
                              {item.meta}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Right: Badge Tag & Arrow */}
                      <View className="flex-row items-center gap-2">
                        {isItemStarting ? (
                          <ActivityIndicator size="small" color="#4186F7" />
                        ) : (
                          <>
                            <View
                              style={{ backgroundColor: badge.bg }}
                              className="px-3 py-1 rounded-full"
                            >
                              <Text
                                style={{ color: badge.text }}
                                className="text-[11px] font-urbanist-bold"
                              >
                                {badge.label}
                              </Text>
                            </View>
                            <ArrowRight2 size={16} color="#8A8A8E" variant="Linear" />
                          </>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
