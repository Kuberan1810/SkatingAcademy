import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  BackHandler,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import {
  Award,
  Call,
  Calendar,
  Logout,
  MedalStar,
  Profile2User,
  Refresh2,
  SecuritySafe,
  ShieldTick,
  Sms,
  TickCircle,
  User,
} from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Toast from '@/components/ui/Toast';
import LogoutConfirmationModal from '@/components/ui/LogoutConfirmationModal';
import { useAuth, useMe } from '@/hooks/use-auth';
import { useDashboard } from '@/hooks/use-dashboard';
import styles from '@/styles/styles';

const getInitials = (name?: string) => {
  if (!name) return 'A';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    return words[0].substring(0, 2).toUpperCase();
  } else if (words.length === 1) {
    return words[0].toUpperCase();
  }
  return 'A';
};

export default function MyProfileOverview() {
  const { user: authUser, logoutAsync, isLoggingOut } = useAuth();
  const { data: realtimeUser, refetch: refetchUser, isRefetching: isRefetchingUser } = useMe();
  const { data: dashboardData, refetch: refetchDashboard, isRefetching: isRefetchingDashboard } = useDashboard();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const user = realtimeUser || authUser;
  const isRefreshing = isRefetchingUser || isRefetchingDashboard;

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
      if (showLogoutModal) {
        setShowLogoutModal(false);
        return true;
      }
      handleBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showLogoutModal]);

  const handleRefresh = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Promise.all([refetchUser(), refetchDashboard()]);
      showToast('Profile data synced successfully', 'success');
    } catch (e) {
      showToast('Failed to sync profile data', 'error');
    }
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await logoutAsync();
    } catch {
      router.replace('/(auth)/login' as any);
    }
  };

  // Realtime or fallback stats
  const totalStudents = dashboardData?.overview?.students?.total ?? 0;
  const totalBatches = dashboardData?.overview?.total_batches ?? 0;
  const memberSince = user?.created_at
    ? dayjs(user.created_at).format('MMM YYYY')
    : 'Sep 2026';

  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <Header
        variant="page"
        title="My Profile"
        showBack={true}
        onBackPress={handleBack}
        rightIcon={Refresh2}
        onRightPress={handleRefresh}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#1F2937']}
            tintColor="#1F2937"
          />
        }
      >
        {/* Profile Hero Card */}
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={[styles.BoxStyle, { backgroundColor: '#FDFDFD', padding: 24 }]}
          className="items-center text-center mb-5"
        >
          {/* Avatar / Initials */}
          <View className="relative mb-3">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 92, height: 92, borderRadius: 46 }}
                className="border-2 border-white shadow-md bg-gray-100"
              />
            ) : (
              <View
                style={[styles.BlackInnerShadowStyle]}
                className="w-[92px] h-[92px] rounded-full bg-[#FFF5ED] items-center justify-center border-2 border-white shadow-sm"
              >
                <Text style={fontStyles.initialsText} className="text-[#F67300] text-[34px]">
                  {getInitials(user?.name)}
                </Text>
              </View>
            )}

            {/* Active Verified Badge */}
            <View className="absolute bottom-0 right-0 bg-[#059669] w-6 h-6 rounded-full items-center justify-center border-2 border-white shadow-sm">
              <TickCircle size={14} color="#FFFFFF" variant="Bold" />
            </View>
          </View>

          {/* Name & Role */}
          <Text style={fontStyles.profileName} className="text-[22px] text-[#1F2937] tracking-tight text-center">
            {user?.name || ''}
          </Text>

          <Text style={fontStyles.profileEmail} className="text-[13px] text-[#6B7280] mt-0.5 text-center">
            {user?.email || 'admin@skatingacademy.com'}
          </Text>

          {/* Role Status Pill */}
          <View className="flex-row items-center bg-[#F3F4F6] border border-[#E5E7EB] rounded-full px-3.5 py-1.5 mt-3.5 gap-2">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <Text style={fontStyles.rolePillText} className="text-[12px] text-[#374151] capitalize">
              {user?.role || 'Head Coach & Admin'}
            </Text>
            <View className="w-1 h-1 rounded-full bg-[#9CA3AF]" />
            <Text style={fontStyles.rolePillSub} className="text-[11px] text-[#059669]">
              Verified
            </Text>
          </View>
        </Animated.View>

        {/* Realtime Academy Stats Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionTitle} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Academy Overview
          </Text>

          <View className="flex-row gap-3">
            {/* Total Students */}
            <View
              style={[styles.BoxStyle2, { padding: 16 }]}
              className="flex-1 bg-[#FDFDFD] border border-[#F2EEF4] rounded-[22px]"
            >
              <View className="w-9 h-9 rounded-[12px] bg-blue-50 items-center justify-center mb-2.5">
                <Profile2User size={20} color="#2563EB" variant="Bulk" />
              </View>
              <Text style={fontStyles.statValue} className="text-[20px] text-[#1F2937]">
                {totalStudents}
              </Text>
              <Text style={fontStyles.statLabel} className="text-[12px] text-[#6B7280] mt-0.5">
                Active Students
              </Text>
            </View>

            {/* Total Batches */}
            <View
              style={[styles.BoxStyle2, { padding: 16 }]}
              className="flex-1 bg-[#FDFDFD] border border-[#F2EEF4] rounded-[22px]"
            >
              <View className="w-9 h-9 rounded-[12px] bg-emerald-50 items-center justify-center mb-2.5">
                <MedalStar size={20} color="#059669" variant="Bulk" />
              </View>
              <Text style={fontStyles.statValue} className="text-[20px] text-[#1F2937]">
                {totalBatches}
              </Text>
              <Text style={fontStyles.statLabel} className="text-[12px] text-[#6B7280] mt-0.5">
                Active Batches
              </Text>
            </View>

            {/* Joined Period */}
            <View
              style={[styles.BoxStyle2, { padding: 16 }]}
              className="flex-1 bg-[#FDFDFD] border border-[#F2EEF4] rounded-[22px]"
            >
              <View className="w-9 h-9 rounded-[12px] bg-purple-50 items-center justify-center mb-2.5">
                <Calendar size={20} color="#7C3AED" variant="Bulk" />
              </View>
              <Text style={fontStyles.statValue} className="text-[16px] text-[#1F2937] leading-[26px]">
                {memberSince}
              </Text>
              <Text style={fontStyles.statLabel} className="text-[12px] text-[#6B7280] mt-0.5">
                Member Since
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Personal & Account Information */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionTitle} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Personal Information
          </Text>
          <View
            style={[styles.BoxStyle2, { padding: 18 }]}
            className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
          >
            {/* Full Name */}
            <View className="flex-row justify-between items-center py-2.5 border-b border-[#F2EEF4]">
              <View className="flex-row items-center gap-2.5">
                <User size={18} color="#6B7280" variant="Linear" />
                <Text style={fontStyles.infoLabel} className="text-[13px] text-[#6B7280]">
                  Full Name
                </Text>
              </View>
              <Text style={fontStyles.infoValue} className="text-[13px] text-[#1F2937]">
                {user?.name || 'Admin'}
              </Text>
            </View>

            {/* Email Address */}
            <View className="flex-row justify-between items-center py-2.5 border-b border-[#F2EEF4]">
              <View className="flex-row items-center gap-2.5">
                <Sms size={18} color="#6B7280" variant="Linear" />
                <Text style={fontStyles.infoLabel} className="text-[13px] text-[#6B7280]">
                  Official Email
                </Text>
              </View>
              <Text style={fontStyles.infoValue} className="text-[13px] text-[#1F2937]">
                {user?.email || 'N/A'}
              </Text>
            </View>

            {/* Phone Number */}
            <View className="flex-row justify-between items-center py-2.5 border-b border-[#F2EEF4]">
              <View className="flex-row items-center gap-2.5">
                <Call size={18} color="#6B7280" variant="Linear" />
                <Text style={fontStyles.infoLabel} className="text-[13px] text-[#6B7280]">
                  Phone Number
                </Text>
              </View>
              {user?.phone ? (
                <Text style={fontStyles.infoValue} className="text-[13px] text-[#1F2937]">
                  {user.phone}
                </Text>
              ) : (
                <Text style={fontStyles.notProvidedText} className="text-[12px] text-[#9CA3AF]">
                  Not Provided
                </Text>
              )}
            </View>

            {/* Coach ID */}
            <View className="flex-row justify-between items-center py-2.5 border-b border-[#F2EEF4]">
              <View className="flex-row items-center gap-2.5">
                <Award size={18} color="#6B7280" variant="Linear" />
                <Text style={fontStyles.infoLabel} className="text-[13px] text-[#6B7280]">
                  Instructor ID
                </Text>
              </View>
              <Text style={fontStyles.infoValue} className="text-[13px] text-[#1F2937]">
                #COACH-{user?.id ?? '001'}
              </Text>
            </View>

            {/* Account Status */}
            <View className="flex-row justify-between items-center pt-2.5">
              <View className="flex-row items-center gap-2.5">
                <ShieldTick size={18} color="#6B7280" variant="Linear" />
                <Text style={fontStyles.infoLabel} className="text-[13px] text-[#6B7280]">
                  Account Status
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                <Text style={fontStyles.statusText} className="text-[11px] text-[#059669]">
                  {user?.is_active !== false ? 'Active & Verified' : 'Suspended'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Coach Privileges & System Access */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionTitle} className="text-[16px] text-[#1F2937] mb-3 px-1">
            System Privileges
          </Text>
          <View
            style={[styles.BoxStyle2, { padding: 18 }]}
            className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
          >
            {[
              { label: 'Batch Creation & Timing Management', granted: true },
              { label: 'Live Session & Attendance Marking', granted: true },
              { label: 'Student Enrollment & Records', granted: true },
              { label: 'Fee Collection & Receipt Logs', granted: true },
              { label: 'Report Generation & Data Exports', granted: true },
            ].map((item, idx, arr) => (
              <View
                key={idx}
                className={`flex-row items-center justify-between py-2.5 ${
                  idx < arr.length - 1 ? 'border-b border-[#F2EEF4]' : ''
                }`}
              >
                <Text style={fontStyles.permissionText} className="text-[13px] text-[#374151] flex-1 mr-2">
                  {item.label}
                </Text>
                <View className="flex-row items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full">
                  <SecuritySafe size={13} color="#2563EB" variant="Bold" />
                  <Text style={fontStyles.accessText} className="text-[11px] text-[#2563EB]">
                    Full Access
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions (Sync / Logout) */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)} className="mb-6 gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRefresh}
            disabled={isRefreshing}
            style={[styles.BoxStyle2, { padding: 16 }]}
            className="flex-row items-center justify-center bg-[#FDFDFD] border border-[#F2EEF4] rounded-[22px] gap-2"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#1F2937" />
            ) : (
              <Refresh2 size={18} color="#1F2937" variant="Linear" />
            )}
            <Text style={fontStyles.actionBtnText} className="text-[14px] text-[#1F2937]">
              {isRefreshing ? 'Syncing Profile...' : 'Sync Realtime Profile'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowLogoutModal(true)}
            style={[styles.BoxStyle2, { padding: 16 }]}
            className="flex-row items-center justify-center bg-red-50/60 border border-red-200/70 rounded-[22px] gap-2"
          >
            <Logout size={18} color="#EF4444" variant="Linear" />
            <Text style={[fontStyles.actionBtnText, { color: '#EF4444' }]} className="text-[14px]">
              Logout from Device
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
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
  initialsText: {
    fontFamily: 'Urbanist_700Bold',
  },
  profileName: {
    fontFamily: 'Urbanist_700Bold',
  },
  profileEmail: {
    fontFamily: 'Urbanist_500Medium',
  },
  rolePillText: {
    fontFamily: 'Urbanist_700Bold',
  },
  rolePillSub: {
    fontFamily: 'Urbanist_600SemiBold',
  },
  sectionTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  statValue: {
    fontFamily: 'Urbanist_700Bold',
  },
  statLabel: {
    fontFamily: 'Urbanist_500Medium',
  },
  infoLabel: {
    fontFamily: 'Urbanist_500Medium',
  },
  infoValue: {
    fontFamily: 'Urbanist_700Bold',
  },
  notProvidedText: {
    fontFamily: 'Urbanist_500Medium',
    fontStyle: 'italic',
    opacity: 0.6,
  },
  statusText: {
    fontFamily: 'Urbanist_700Bold',
  },
  permissionText: {
    fontFamily: 'Urbanist_600SemiBold',
  },
  accessText: {
    fontFamily: 'Urbanist_700Bold',
  },
  actionBtnText: {
    fontFamily: 'Urbanist_700Bold',
  },
});
