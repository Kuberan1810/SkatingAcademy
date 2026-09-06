import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Profile2User, Calendar, Card, Layer, ArrowRight2, SearchNormal1 } from 'iconsax-react-native';
import { GlobalSearchResultItem } from '@/api/search.api';
import StudentAvatar from '@/components/ui/StudentAvatar';

export type { GlobalSearchResultItem };

export interface GlobalSearchResultsProps {
  query: string;
  results?: GlobalSearchResultItem[];
  isLoading?: boolean;
  onSelectResult?: (item: GlobalSearchResultItem) => void;
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

export default function GlobalSearchResults({
  query,
  results = [],
  isLoading = false,
  onSelectResult,
}: GlobalSearchResultsProps) {
  if (!query || query.trim().length < 2) return null;

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

  return (
    <View
      style={{
        position: 'absolute',
        top: 56,
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      }}
      className="bg-white rounded-[24px] border border-primary-border overflow-hidden"
    >
      {/* Top GPay Search Bar Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9]">
        <Text className="text-[12px] font-urbanist-bold text-[#64748B] uppercase tracking-wider">
          Results for "{query.trim()}" ({results.length})
        </Text>
        {isLoading && <ActivityIndicator size="small" color="#4186F7" />}
      </View>

      {/* Loading / Empty / Results List */}
      {isLoading && results.length === 0 ? (
        <View className="py-8 items-center justify-center flex-row gap-2.5">
          <ActivityIndicator size="small" color="#4186F7" />
          <Text className="text-[14px] font-urbanist-medium text-[#64748B]">
            Searching across records...
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View className="py-8 items-center justify-center">
          <SearchNormal1 size={32} color="#94A3B8" variant="Linear" />
          <Text className="text-[15px] font-urbanist-bold text-[#1E293B] mt-2">
            No results found
          </Text>
          <Text className="text-[13px] font-urbanist-medium text-[#64748B] text-center mt-0.5 px-6">
            We couldn't find matching records for "{query}".
          </Text>
        </View>
      ) : (
        <ScrollView
          nestedScrollEnabled={true}
          style={{ maxHeight: 340 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="pb-2">
            {grouped.map((group) => (
              <View key={group.title} className="pt-2">
                {/* GPay Section Header */}
                <View className="px-4 py-1.5 bg-[#F8FAFC]">
                  <Text className="text-[10px] font-urbanist-bold text-[#94A3B8] uppercase tracking-widest">
                    {group.title}
                  </Text>
                </View>

                {/* Group Items List (Clean Row Items, No Card Box!) */}
                {group.data.map((item, idx) => {
                  const badge = getResultBadgeConfig(item.type);
                  const IconComponent = badge.icon;
                  const isStudent = item.type.toLowerCase() === 'student';
                  const isLast = idx === group.data.length - 1;

                  return (
                    <TouchableOpacity
                      key={`${item.type}-${item.id}`}
                      activeOpacity={0.7}
                      onPress={() => onSelectResult && onSelectResult(item)}
                      className={`flex-row items-center justify-between px-4 py-3.5 bg-white active:bg-[#F1F5F9] ${
                        !isLast ? 'border-b border-primary-border' : ''
                      }`}
                    >
                      {/* Left: Round GPay Avatar (44px) */}
                      <View className="flex-row items-center flex-1 mr-3 gap-3.5">
                        {isStudent ? (
                          <StudentAvatar
                            name={item.title}
                            avatarUri={item.image}
                            size={44}
                          />
                        ) : (
                          <View
                            style={{ backgroundColor: badge.bg }}
                            className="w-[44px] h-[44px] rounded-full items-center justify-center"
                          >
                            <IconComponent size={22} color={badge.text} variant="Linear" />
                          </View>
                        )}

                        {/* Title & Subtitle */}
                        <View className="flex-1 justify-center">
                          <Text
                            numberOfLines={1}
                            className="text-[15px] font-urbanist-bold text-[#0F172A] tracking-tight"
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
                        </View>
                      </View>

                      {/* Right: GPay Style Minimal Pill & Arrow */}
                      <View className="flex-row items-center gap-2">
                        <View
                          style={{ backgroundColor: badge.bg }}
                          className="px-2.5 py-1 rounded-full"
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
          </View>
        </ScrollView>
      )}
    </View>
  );
}
