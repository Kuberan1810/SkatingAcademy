import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
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
import { GlobalSearchResultItem } from '@/api/search.api';
import { useGlobalSearch } from '@/hooks/use-global-search';
import StudentAvatar from '@/components/ui/StudentAvatar';

export interface GlobalSearchModalProps {
  visible: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelectResult: (item: GlobalSearchResultItem) => void;
}

export function getResultBadgeConfig(type: string) {
  const cleanType = (type || '').toLowerCase();
  switch (cleanType) {
    case 'student':
      return { label: 'Student', bg: '#EFF6FF', text: '#2563EB', icon: Profile2User };
    case 'batch':
      return { label: 'Batch', bg: '#F3E8FF', text: '#7C3AED', icon: Layer };
    case 'payment':
    case 'fee':
    case 'pending_fee':
      return { label: 'Payment', bg: '#FEF3C7', text: '#D97706', icon: Card };
    case 'session':
      return { label: 'Session', bg: '#ECFDF5', text: '#059669', icon: Calendar };
    default:
      return { label: type || 'Result', bg: '#F1F5F9', text: '#475569', icon: SearchNormal1 };
  }
}

export default function GlobalSearchModal({
  visible,
  initialQuery = '',
  onClose,
  onSelectResult,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const { data: searchData, isLoading } = useGlobalSearch(query);

  const results = searchData?.results || [];

  // Group items GPay-style into categories
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

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleSelect = (item: GlobalSearchResultItem) => {
    setQuery('');
    onSelectResult(item);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Top GPay Search Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-[#F1F5F9] gap-3">
          {/* Back Button Arrow */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            className="w-[40px] h-[40px] rounded-full items-center justify-center bg-[#F8FAFC]"
          >
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>

          {/* Search Input Pill */}
          <View className="flex-1 flex-row items-center bg-[#F1F5F9] rounded-full px-4 h-[46px] gap-2.5">
            <SearchNormal1 size={18} color="#64748B" variant="Linear" />
            <TextInput
              autoFocus={true}
              value={query}
              onChangeText={setQuery}
              placeholder="Search students, batches, payments..."
              placeholderTextColor="#94A3B8"
              className="flex-1 text-[15px] font-urbanist-semibold text-[#0F172A] p-0"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={() => setQuery('')}>
                <CloseCircle size={18} color="#94A3B8" variant="Bold" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Full Screen Body Content */}
        {query.trim().length < 2 ? (
          /* Initial Search Hints / Quick Tags */
          <View className="p-5">
            <Text className="text-[12px] font-urbanist-bold text-[#94A3B8] uppercase tracking-widest mb-3">
              Quick Suggestions
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {['Students', 'Batches', 'Pending Fees', 'Sessions'].map((hint) => (
                <TouchableOpacity
                  key={hint}
                  activeOpacity={0.7}
                  onPress={() => setQuery(hint)}
                  className="px-4 py-2.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex-row items-center gap-2"
                >
                  <SearchNormal1 size={14} color="#64748B" />
                  <Text className="text-[14px] font-urbanist-semibold text-[#334155]">
                    {hint}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : isLoading && results.length === 0 ? (
          /* Loading State */
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator size="large" color="#4186F7" />
            <Text className="text-[14px] font-urbanist-medium text-[#64748B]">
              Searching records...
            </Text>
          </View>
        ) : results.length === 0 ? (
          /* Empty Search State */
          <View className="flex-1 items-center justify-center px-6">
            <SearchNormal1 size={48} color="#CBD5E1" variant="Linear" />
            <Text className="text-[17px] font-urbanist-bold text-[#0F172A] mt-3">
              No results found
            </Text>
            <Text className="text-[14px] font-urbanist-medium text-[#64748B] text-center mt-1">
              We couldn't find any student, batch, or payment record matching "{query}".
            </Text>
          </View>
        ) : (
          /* Full Screen Results List */
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {grouped.map((group) => (
              <View key={group.title} className="pt-2">
                {/* GPay Category Section Header */}
                <View className="px-5 py-2 bg-[#F8FAFC] border-y border-[#F1F5F9]">
                  <Text className="text-[11px] font-urbanist-bold text-[#94A3B8] uppercase tracking-widest">
                    {group.title} ({group.data.length})
                  </Text>
                </View>

                {/* Group Item List Rows */}
                {group.data.map((item, idx) => {
                  const badge = getResultBadgeConfig(item.type);
                  const IconComponent = badge.icon;
                  const isStudent = item.type.toLowerCase() === 'student';
                  const isLast = idx === group.data.length - 1;

                  return (
                    <TouchableOpacity
                      key={`${item.type}-${item.id}`}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item)}
                      className={`flex-row items-center justify-between px-5 py-4 bg-white active:bg-[#F8FAFC] ${
                        !isLast ? 'border-b border-[#F1F5F9]' : ''
                      }`}
                    >
                      {/* Left: 44px Round Avatar / Icon */}
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
                            className="text-[16px] font-urbanist-bold text-[#0F172A] tracking-tight"
                          >
                            {item.title}
                          </Text>
                          {item.subtitle ? (
                            <Text
                              numberOfLines={1}
                              className="text-[13px] font-urbanist-medium text-[#64748B] mt-0.5"
                            >
                              {item.subtitle}
                            </Text>
                          ) : null}
                          {item.meta ? (
                            <Text
                              numberOfLines={1}
                              className="text-[12px] font-urbanist-medium text-[#94A3B8] mt-0.5"
                            >
                              {item.meta}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Right: Badge Tag & Arrow */}
                      <View className="flex-row items-center gap-2">
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
                        <ArrowRight2 size={16} color="#94A3B8" variant="Linear" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
