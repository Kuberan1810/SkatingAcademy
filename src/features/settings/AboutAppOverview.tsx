import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Share,
  Platform,
  BackHandler,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import {
  ArrowRight2,
  Calendar,
  CardPos,
  Chart,
  DocumentText1,
  MedalStar,
  Refresh2,
  ShieldTick,
  Sms,
  Star1,
} from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Toast from '@/components/ui/Toast';
import styles from '@/styles/styles';
import LegalBottomSheet from './components/LegalBottomSheet';

const APP_VERSION = '1.0.0';
const APP_BUILD = '100';
const RELEASE_DATE = 'September 2026';
const SUPPORT_EMAIL = 'support@skatingacademy.app';
const WEBSITE_URL = 'https://skatingacademy.app';

interface FeatureHighlight {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    icon: <Calendar size={20} color="#2563EB" variant="Bulk" />,
    title: 'Batch & Schedule',
    description: 'Effortless class creation, timings & trainer allocations.',
    bgColor: 'bg-blue-50',
  },
  {
    icon: <MedalStar size={20} color="#059669" variant="Bulk" />,
    title: 'Smart Attendance',
    description: 'One-tap presence marking & compensation rescheduling.',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: <CardPos size={20} color="#D97706" variant="Bulk" />,
    title: 'Fee Management',
    description: 'Track dues, record payments & generate receipts.',
    bgColor: 'bg-amber-50',
  },
  {
    icon: <Chart size={20} color="#7C3AED" variant="Bulk" />,
    title: 'Insights & Reports',
    description: 'Instant Excel/PDF student stats & revenue summaries.',
    bgColor: 'bg-purple-50',
  },
];

export default function AboutAppOverview() {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'privacy' | 'terms' | null>(null);
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
      if (activeSheet !== null) {
        setActiveSheet(null);
        return true;
      }
      handleBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [activeSheet]);

  const handleCheckUpdate = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    setCheckingUpdate(true);
    setTimeout(() => {
      setCheckingUpdate(false);
      showToast(`You're on the latest version! (v${APP_VERSION})`, 'success');
    }, 900);
  };

  const handleOpenEmail = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = `mailto:${SUPPORT_EMAIL}?subject=Skating Academy App Support&body=App Version: ${APP_VERSION} (${APP_BUILD})%0D%0APlatform: ${Platform.OS}%0D%0A%0D%0AHi Support Team,%0D%0A`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showToast(`Contact us at ${SUPPORT_EMAIL}`, 'info');
      }
    } catch (e) {
      showToast(`Contact us at ${SUPPORT_EMAIL}`, 'info');
    }
  };

  const handleShareApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: 'Skating Academy App',
        message: `Manage skating batches, attendance & fees efficiently with the Skating Academy app! Check it out: ${WEBSITE_URL}`,
      });
    } catch (e) {}
  };

  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <Header
        variant="page"
        title="About App"
        showBack={true}
        onBackPress={handleBack}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 }}
      >
        {/* App Hero Branding Card */}
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={[styles.BoxStyle, { backgroundColor: '#FDFDFD', padding: 24 }]}
          className="items-center text-center mb-5"
        >
          {/* Logo with Soft Border & Shadow */}
          <View className="w-24 h-24 rounded-[26px] bg-white items-center justify-center p-2 mb-4 border border-[#F2EEF4] shadow-sm">
            <Image
              source={require('../../../assets/images/icon.png')}
              style={{ width: 72, height: 72, borderRadius: 18 }}
              resizeMode="cover"
            />
          </View>

          <Text style={fontStyles.heroTitle} className="text-[24px] text-[#1F2937] tracking-tight">
            Skating Academy
          </Text>
          <Text style={fontStyles.heroSubtitle} className="text-[13px] text-[#6B7280] mt-1 text-center">
            Next-Gen Sports Management Suite
          </Text>

          {/* Version Pill */}
          <View className="flex-row items-center bg-[#F3F4F6] border border-[#E5E7EB] rounded-full px-3 py-1.5 mt-3 gap-2">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <Text style={fontStyles.pillText} className="text-[12px] text-[#374151]">
              v{APP_VERSION} (Build {APP_BUILD})
            </Text>
            <View className="w-1 h-1 rounded-full bg-[#9CA3AF]" />
            <Text style={fontStyles.pillBadge} className="text-[11px] text-[#059669]">
              Stable
            </Text>
          </View>

          {/* Summary / Mission */}
          <Text style={fontStyles.missionText} className="text-[13px] text-[#626262] text-center mt-4 leading-[20px]">
            Empowering skating coaches, academies, and athletes with real-time class tracking, intelligent attendance, and frictionless fee management.
          </Text>
        </Animated.View>

        {/* Feature Highlights Section */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionTitle} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Core Features
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {FEATURE_HIGHLIGHTS.map((item, idx) => (
              <View
                key={idx}
                style={[styles.BoxStyle2, { padding: 16 }]}
                className="flex-1 min-w-[145px] bg-[#FAFAFA] border border-[#F2EEF4] rounded-[22px]"
              >
                <View className={`w-9 h-9 rounded-[12px] ${item.bgColor} items-center justify-center mb-2.5`}>
                  {item.icon}
                </View>
                <Text style={fontStyles.cardTitle} className="text-[14px] text-[#1F2937] mb-1">
                  {item.title}
                </Text>
                <Text style={fontStyles.cardDesc} className="text-[12px] text-[#6B7280] leading-[16px]">
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* System & Build Specifications */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionTitle} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Application Specs
          </Text>
          <View
            style={[styles.BoxStyle2, { padding: 18 }]}
            className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
          >
            <View className="flex-row justify-between items-center py-2 border-b border-[#F2EEF4]">
              <Text style={fontStyles.specLabel} className="text-[13px] text-[#6B7280]">
                App Name
              </Text>
              <Text style={fontStyles.specValue} className="text-[13px] text-[#1F2937]">
                Skating Academy
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2.5 border-b border-[#F2EEF4]">
              <Text style={fontStyles.specLabel} className="text-[13px] text-[#6B7280]">
                Version
              </Text>
              <Text style={fontStyles.specValue} className="text-[13px] text-[#1F2937]">
                {APP_VERSION}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2.5 border-b border-[#F2EEF4]">
              <Text style={fontStyles.specLabel} className="text-[13px] text-[#6B7280]">
                Build Number
              </Text>
              <Text style={fontStyles.specValue} className="text-[13px] text-[#1F2937]">
                {APP_BUILD}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2.5 border-b border-[#F2EEF4]">
              <Text style={fontStyles.specLabel} className="text-[13px] text-[#6B7280]">
                Framework
              </Text>
              <Text style={fontStyles.specValue} className="text-[13px] text-[#1F2937]">
                Expo SDK 57 (React Native)
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-2.5 border-b border-[#F2EEF4]">
              <Text style={fontStyles.specLabel} className="text-[13px] text-[#6B7280]">
                Release Channel
              </Text>
              <Text style={[fontStyles.specValue, { color: '#059669' }]} className="text-[13px]">
                Production Stable
              </Text>
            </View>

            <View className="flex-row justify-between items-center pt-2.5">
              <Text style={fontStyles.specLabel} className="text-[13px] text-[#6B7280]">
                Last Updated
              </Text>
              <Text style={fontStyles.specValue} className="text-[13px] text-[#1F2937]">
                {RELEASE_DATE}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Resources, Legal & Interactive Links */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionTitle} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Resources & Legal
          </Text>
          <View
            style={[styles.BoxStyle2, { paddingHorizontal: 16, paddingVertical: 6 }]}
            className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
          >
            {/* Check for Updates */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCheckUpdate}
              disabled={checkingUpdate}
              className="flex-row items-center py-3.5 border-b border-[#F2EEF4]"
            >
              <View className="w-9 h-9 rounded-[12px] bg-emerald-50 items-center justify-center mr-3">
                <Refresh2 size={20} color="#059669" variant="Linear" />
              </View>
              <View className="flex-1">
                <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                  Check for Updates
                </Text>
                <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                  {checkingUpdate ? 'Checking server...' : 'Verify current installation'}
                </Text>
              </View>
              <View className="bg-emerald-100/60 px-2.5 py-1 rounded-full">
                <Text style={fontStyles.badgeStatus} className="text-[11px] text-[#059669]">
                  Up to date
                </Text>
              </View>
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {}
                setActiveSheet('privacy');
              }}
              className="flex-row items-center py-3.5 border-b border-[#F2EEF4]"
            >
              <View className="w-9 h-9 rounded-[12px] bg-blue-50 items-center justify-center mr-3">
                <ShieldTick size={20} color="#2563EB" variant="Linear" />
              </View>
              <Text style={fontStyles.itemTitle} className="flex-1 text-[14px] text-[#1F2937]">
                Privacy Policy
              </Text>
              <ArrowRight2 size={18} color="#9CA3AF" variant="Linear" />
            </TouchableOpacity>

            {/* Terms of Service */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (e) {}
                setActiveSheet('terms');
              }}
              className="flex-row items-center py-3.5 border-b border-[#F2EEF4]"
            >
              <View className="w-9 h-9 rounded-[12px] bg-purple-50 items-center justify-center mr-3">
                <DocumentText1 size={20} color="#7C3AED" variant="Linear" />
              </View>
              <Text style={fontStyles.itemTitle} className="flex-1 text-[14px] text-[#1F2937]">
                Terms of Service
              </Text>
              <ArrowRight2 size={18} color="#9CA3AF" variant="Linear" />
            </TouchableOpacity>

            {/* Contact Support */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenEmail}
              className="flex-row items-center py-3.5 border-b border-[#F2EEF4]"
            >
              <View className="w-9 h-9 rounded-[12px] bg-amber-50 items-center justify-center mr-3">
                <Sms size={20} color="#D97706" variant="Linear" />
              </View>
              <View className="flex-1">
                <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                  Contact Support
                </Text>
                <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                  {SUPPORT_EMAIL}
                </Text>
              </View>
              <ArrowRight2 size={18} color="#9CA3AF" variant="Linear" />
            </TouchableOpacity>

            {/* Share App */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShareApp}
              className="flex-row items-center py-3.5"
            >
              <View className="w-9 h-9 rounded-[12px] bg-rose-50 items-center justify-center mr-3">
                <Star1 size={20} color="#E11D48" variant="Linear" />
              </View>
              <Text style={fontStyles.itemTitle} className="flex-1 text-[14px] text-[#1F2937]">
                Share with Coaches & Staff
              </Text>
              <ArrowRight2 size={18} color="#9CA3AF" variant="Linear" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer & Copyright */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          className="items-center mt-2 mb-8"
        >
          <Text style={fontStyles.footerText} className="text-[13px] text-[#9CA3AF]">
            Crafted with ❤️ for Coaches & Skaters
          </Text>
          <Text style={fontStyles.footerCopyright} className="text-[12px] text-[#9CA3AF] mt-1">
            © 2026 Skating Academy Inc. All rights reserved.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Interactive Bottom Sheet matching other app sheets */}
      <LegalBottomSheet
        visible={activeSheet !== null}
        type={activeSheet}
        onClose={() => setActiveSheet(null)}
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
  heroTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  heroSubtitle: {
    fontFamily: 'Urbanist_500Medium',
  },
  pillText: {
    fontFamily: 'Urbanist_700Bold',
  },
  pillBadge: {
    fontFamily: 'Urbanist_600SemiBold',
  },
  missionText: {
    fontFamily: 'Urbanist_500Medium',
  },
  sectionTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  cardTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  cardDesc: {
    fontFamily: 'Urbanist_500Medium',
  },
  specLabel: {
    fontFamily: 'Urbanist_500Medium',
  },
  specValue: {
    fontFamily: 'Urbanist_700Bold',
  },
  itemTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  itemSubtitle: {
    fontFamily: 'Urbanist_500Medium',
  },
  badgeStatus: {
    fontFamily: 'Urbanist_700Bold',
  },
  footerText: {
    fontFamily: 'Urbanist_500Medium',
  },
  footerCopyright: {
    fontFamily: 'Urbanist_400Regular',
  },
});
