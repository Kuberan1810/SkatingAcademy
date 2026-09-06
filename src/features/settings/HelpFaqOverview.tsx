import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  BackHandler,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import {
  ArrowDown2,
  CallCalling,
  MessageQuestion,
  Sms,
  Star1,
} from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Search from '@/components/ui/Search';
import Toast from '@/components/ui/Toast';
import styles from '@/styles/styles';
import FeedbackBottomSheet from './components/FeedbackBottomSheet';

interface FAQItem {
  id: string;
  category: 'batches' | 'attendance' | 'fees' | 'students' | 'general';
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: '1',
    category: 'batches',
    question: 'How do I start and conduct a live class session?',
    answer:
      'Go to the Dashboard or Batches tab, locate your scheduled class session card, and tap the "Start" button. Once inside the session, you can mark students Present, Absent, or Late in real-time before completing the session.',
  },
  {
    id: '2',
    category: 'attendance',
    question: 'How does compensation scheduling work for missed classes?',
    answer:
      'If a student missed a scheduled batch, open the batch details or student profile, tap "Schedule Compensation", select the target replacement batch date and time slot, and confirm the makeup session.',
  },
  {
    id: '3',
    category: 'fees',
    question: 'How do I collect fees, apply discounts, and record payments?',
    answer:
      'In the Fees tab, search for the student and tap "Collect Fee". You can enter any custom discount or late fine, choose the payment method (Cash, UPI, Card, Net Banking), and tap "Confirm Collection" to record the transaction.',
  },
  {
    id: '4',
    category: 'fees',
    question: 'How do I export fee summaries and student reports to Excel/PDF?',
    answer:
      'Tap the Export icon on the top header of the Fees or Student List screens. Select your desired date range, report format (Excel or PDF), and tap "Export" to generate and share the file immediately.',
  },
  {
    id: '5',
    category: 'students',
    question: 'Can I import multiple students in bulk?',
    answer:
      'Yes! When adding new students, choose the "Bulk Import" option. You can paste or import student rosters with names, phone numbers, and batch assignments in one step.',
  },
  {
    id: '6',
    category: 'batches',
    question: 'What happens if I accidentally exit during an active class?',
    answer:
      'The app triggers a safety alert asking for confirmation. If you exit, the session state is finalized and marked so coaches do not lose attendance records already entered.',
  },
  {
    id: '7',
    category: 'general',
    question: 'Can I use the app without an active internet connection?',
    answer:
      'Yes, with "Offline Coaching Mode" enabled in App Settings, student lists and batch schedules are cached locally on your device and will sync when you reconnect to Wi-Fi or mobile data.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'batches', label: 'Batches' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'fees', label: 'Fees & Dues' },
  { id: 'students', label: 'Students' },
  { id: 'general', label: 'General' },
];

const SUPPORT_PHONE = '+919876543210';
const SUPPORT_EMAIL = 'support@skatingacademy.app';

export default function HelpFaqOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: 'success' | 'info' | 'error' | 'delete';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const { hideTabBar, showTabBar } = useTabBarVisibility();

  useEffect(() => {
    hideTabBar();
    return () => {
      showTabBar();
    };
  }, []);

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/settings' as any);
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      if (showFeedbackSheet) {
        setShowFeedbackSheet(false);
        return true;
      }
      handleBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showFeedbackSheet]);

  const toggleAccordion = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_LIST.filter((faq) => {
      const matchCat = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handleCallSupport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Linking.openURL(`tel:${SUPPORT_PHONE}`);
    } catch (e) {
      showToast(`Call us at ${SUPPORT_PHONE}`, 'info');
    }
  };

  const handleEmailSupport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Help & Support Request`);
    } catch (e) {
      showToast(`Email us at ${SUPPORT_EMAIL}`, 'info');
    }
  };

  const handleFeedbackSubmit = (data: { category: string; rating: number; message: string }) => {
    showToast('Thank you! Your feedback has been received.', 'success');
  };

  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <Header
        variant="page"
        title="Help & FAQ"
        showBack={true}
        onBackPress={handleBack}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <Animated.View entering={FadeInUp.duration(400)} className="mb-4">
          <Search
            placeholder="Search questions, troubleshooting..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            showFilter={false}
            className="px-0 py-0"
          />
        </Animated.View>

        {/* Category Horizontal Pills */}
        <Animated.View entering={FadeInUp.delay(80).duration(400)} className="mb-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch (e) {}
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-[#1F2937] border-[#1F2937]'
                      : 'bg-[#F9FAFB] border-[#E5E7EB]'
                  }`}
                >
                  <Text
                    style={[
                      fontStyles.pillText,
                      { color: isSelected ? '#FFFFFF' : '#4B5563' },
                    ]}
                    className="text-[13px]"
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* FAQ Accordion List */}
        <Animated.View entering={FadeInUp.delay(160).duration(400)} className="mb-6">
          <Text style={fontStyles.sectionTitle} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Frequently Asked Questions
          </Text>

          {filteredFaqs.length === 0 ? (
            <View
              style={[styles.BoxStyle2, { padding: 28 }]}
              className="items-center justify-center bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
            >
              <MessageQuestion size={36} color="#9CA3AF" variant="Linear" />
              <Text style={fontStyles.emptyTitle} className="text-[15px] text-[#374151] mt-2">
                No matching questions found
              </Text>
              <Text style={fontStyles.emptySubtitle} className="text-[13px] text-[#9CA3AF] text-center mt-1">
                Try searching for different keywords or reach out to our support team below.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <Animated.View
                    key={faq.id}
                    layout={Layout.springify()}
                    style={[styles.BoxStyle2, { padding: 16 }]}
                    className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[22px]"
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleAccordion(faq.id)}
                      className="flex-row items-center justify-between"
                    >
                      <Text
                        style={fontStyles.faqQuestion}
                        className="flex-1 text-[14px] text-[#1F2937] pr-3 leading-[20px]"
                      >
                        {faq.question}
                      </Text>
                      <View
                        className={`w-7 h-7 rounded-full items-center justify-center ${
                          isExpanded ? 'bg-[#1F2937]' : 'bg-[#F3F4F6]'
                        }`}
                      >
                        <ArrowDown2
                          size={14}
                          color={isExpanded ? '#FFFFFF' : '#6B7280'}
                          variant="Linear"
                          style={{
                            transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                          }}
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <Animated.View entering={FadeInDown.duration(200)} className="pt-3 mt-3 border-t border-[#F2EEF4]">
                        <Text style={fontStyles.faqAnswer} className="text-[13px] text-[#4B5563] leading-[22px]">
                          {faq.answer}
                        </Text>
                      </Animated.View>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* Direct Contact Support Cards */}
        <Animated.View entering={FadeInUp.delay(240).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionTitle} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Need More Help?
          </Text>

          <View className="flex-row gap-3 mb-3">
            {/* Call Support */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCallSupport}
              style={[styles.BoxStyle2, { padding: 16 }]}
              className="flex-1 bg-[#FDFDFD] border border-[#F2EEF4] rounded-[22px]"
            >
              <View className="w-10 h-10 rounded-[14px] bg-emerald-50 items-center justify-center mb-2.5">
                <CallCalling size={22} color="#059669" variant="Bold" />
              </View>
              <Text style={fontStyles.supportCardTitle} className="text-[14px] text-[#1F2937]">
                Call Helpline
              </Text>
              <Text style={fontStyles.supportCardDesc} className="text-[12px] text-[#6B7280] mt-0.5">
                Direct phone assistance
              </Text>
            </TouchableOpacity>

            {/* Email Support */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEmailSupport}
              style={[styles.BoxStyle2, { padding: 16 }]}
              className="flex-1 bg-[#FDFDFD] border border-[#F2EEF4] rounded-[22px]"
            >
              <View className="w-10 h-10 rounded-[14px] bg-blue-50 items-center justify-center mb-2.5">
                <Sms size={22} color="#2563EB" variant="Bold" />
              </View>
              <Text style={fontStyles.supportCardTitle} className="text-[14px] text-[#1F2937]">
                Email Us
              </Text>
              <Text style={fontStyles.supportCardDesc} className="text-[12px] text-[#6B7280] mt-0.5">
                Quick response via mail
              </Text>
            </TouchableOpacity>
          </View>

          {/* Feedback & Suggestion Banner */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (e) {}
              setShowFeedbackSheet(true);
            }}
            style={[styles.BoxStyle2, { padding: 16 }]}
            className="flex-row items-center bg-[#FDFDFD] border border-[#F2EEF4] rounded-[22px]"
          >
            <View className="w-10 h-10 rounded-[14px] bg-amber-50 items-center justify-center mr-3">
              <Star1 size={22} color="#D97706" variant="Bold" />
            </View>
            <View className="flex-1 mr-2">
              <Text style={fontStyles.supportCardTitle} className="text-[14px] text-[#1F2937]">
                Send Feedback & Suggestions
              </Text>
              <Text style={fontStyles.supportCardDesc} className="text-[12px] text-[#6B7280] mt-0.5">
                Share bug reports or feature ideas with our team
              </Text>
            </View>
            <View className="bg-[#1F2937] px-3 py-1.5 rounded-full">
              <Text style={fontStyles.feedbackBtnText} className="text-[12px] text-white">
                Feedback
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} className="items-center mt-2 mb-8">
          <Text style={fontStyles.footerText} className="text-[12px] text-[#9CA3AF]">
            Support hours: Mon - Sat • 9:00 AM to 8:00 PM IST
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Feedback Bottom Sheet */}
      <FeedbackBottomSheet
        visible={showFeedbackSheet}
        onClose={() => setShowFeedbackSheet(false)}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Toast Notification Banner */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </ScreenWrapper>
  );
}

const fontStyles = StyleSheet.create({
  pillText: {
    fontFamily: 'Urbanist_700Bold',
  },
  sectionTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  emptyTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  emptySubtitle: {
    fontFamily: 'Urbanist_500Medium',
  },
  faqQuestion: {
    fontFamily: 'Urbanist_700Bold',
  },
  faqAnswer: {
    fontFamily: 'Urbanist_500Medium',
  },
  supportCardTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  supportCardDesc: {
    fontFamily: 'Urbanist_500Medium',
  },
  feedbackBtnText: {
    fontFamily: 'Urbanist_700Bold',
  },
  footerText: {
    fontFamily: 'Urbanist_500Medium',
  },
});
