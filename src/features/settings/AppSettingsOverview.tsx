import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useTabBarVisibility } from '@/context/tab-bar-visibility';
import {
  Clock,
  FingerScan,
  NotificationBing,
  Refresh2,
  Trash,
  VolumeHigh,
  WalletMoney,
} from 'iconsax-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/screen-wrapper';
import Header from '@/components/ui/Header';
import Toast from '@/components/ui/Toast';
import FigmaSwitch from '@/components/ui/FigmaSwitch';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import styles from '@/styles/styles';

export default function AppSettingsOverview() {
  // Toggle states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [feeDueAlerts, setFeeDueAlerts] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [autoMarkAbsent, setAutoMarkAbsent] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  // Preference selections
  const [selectedDuration, setSelectedDuration] = useState<'60' | '90' | '120'>('60');
  const [cacheSize, setCacheSize] = useState('14.8 MB');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: 'success' | 'info' | 'error' | 'delete';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'delete' = 'success') => {
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
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/settings' as any);
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      if (showClearCacheModal) {
        setShowClearCacheModal(false);
        return true;
      }
      handleBack();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [showClearCacheModal, hapticsEnabled]);

  const handleToggle = (setter: (val: boolean | ((prev: boolean) => boolean)) => void, currentVal: boolean) => {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    setter(!currentVal);
  };

  const handleDurationSelect = (dur: '60' | '90' | '120') => {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    setSelectedDuration(dur);
    showToast(`Default class duration set to ${dur} mins`, 'success');
  };

  const handleClearCacheConfirm = () => {
    setShowClearCacheModal(false);
    setIsClearingCache(true);
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}
    }

    setTimeout(() => {
      const freed = cacheSize;
      setCacheSize('0.0 KB');
      setIsClearingCache(false);
      showToast(`Cache cleared! Freed ${freed} storage.`, 'success');
    }, 600);
  };

  const handleResetPreferences = () => {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
    }
    Alert.alert(
      'Reset All Preferences?',
      'This will reset notification alerts, sound, and session defaults back to factory default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Defaults',
          style: 'destructive',
          onPress: () => {
            setPushNotifications(true);
            setSessionReminders(true);
            setFeeDueAlerts(true);
            setHapticsEnabled(true);
            setSoundEffects(false);
            setAutoMarkAbsent(true);
            setOfflineSync(true);
            setSelectedDuration('60');
            showToast('App preferences reset to defaults', 'info');
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper className="bg-white">
      {/* Header */}
      <Header
        variant="page"
        title="App Settings"
        showBack={true}
        onBackPress={handleBack}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 }}
      >
        {/* Section 1: Notifications & Alerts */}
        <Animated.View entering={FadeInUp.duration(400)} className="mb-5">
          <Text style={fontStyles.sectionHeading} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Notifications & Alerts
          </Text>
          <View
            style={[styles.BoxStyle2, { paddingHorizontal: 16, paddingVertical: 6 }]}
            className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
          >
            {/* Push Notifications */}
            <View className="flex-row items-center justify-between py-3.5 border-b border-[#F2EEF4]">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-9 h-9 rounded-[12px] bg-blue-50 items-center justify-center mr-3">
                  <NotificationBing size={20} color="#2563EB" variant="Linear" />
                </View>
                <View className="flex-1">
                  <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                    Push Notifications
                  </Text>
                  <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                    Enable real-time push updates & badges
                  </Text>
                </View>
              </View>
              <FigmaSwitch
                value={pushNotifications}
                onValueChange={() => handleToggle(setPushNotifications, pushNotifications)}
              />
            </View>

            {/* Session Reminders */}
            <View className="flex-row items-center justify-between py-3.5 border-b border-[#F2EEF4]">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-9 h-9 rounded-[12px] bg-amber-50 items-center justify-center mr-3">
                  <Clock size={20} color="#D97706" variant="Linear" />
                </View>
                <View className="flex-1">
                  <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                    Class Session Reminders
                  </Text>
                  <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                    Notify 30 mins before scheduled batches
                  </Text>
                </View>
              </View>
              <FigmaSwitch
                value={sessionReminders}
                onValueChange={() => handleToggle(setSessionReminders, sessionReminders)}
                disabled={!pushNotifications}
              />
            </View>

            {/* Fee Due Reminders */}
            <View className="flex-row items-center justify-between py-3.5">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-9 h-9 rounded-[12px] bg-emerald-50 items-center justify-center mr-3">
                  <WalletMoney size={20} color="#059669" variant="Linear" />
                </View>
                <View className="flex-1">
                  <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                    Pending Fee Alerts
                  </Text>
                  <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                    Alerts on overdue monthly payments
                  </Text>
                </View>
              </View>
              <FigmaSwitch
                value={feeDueAlerts}
                onValueChange={() => handleToggle(setFeeDueAlerts, feeDueAlerts)}
                disabled={!pushNotifications}
              />
            </View>
          </View>
        </Animated.View>

        {/* Section 2: Experience & Haptics */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionHeading} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Experience & Feedback
          </Text>
          <View
            style={[styles.BoxStyle2, { paddingHorizontal: 16, paddingVertical: 6 }]}
            className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
          >
            {/* Haptic Vibrations */}
            <View className="flex-row items-center justify-between py-3.5 border-b border-[#F2EEF4]">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-9 h-9 rounded-[12px] bg-purple-50 items-center justify-center mr-3">
                  <FingerScan size={20} color="#7C3AED" variant="Linear" />
                </View>
                <View className="flex-1">
                  <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                    Haptic Vibrations
                  </Text>
                  <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                    Tactile response on buttons and sheets
                  </Text>
                </View>
              </View>
              <FigmaSwitch
                value={hapticsEnabled}
                onValueChange={() => handleToggle(setHapticsEnabled, hapticsEnabled)}
              />
            </View>

            {/* Sound Effects */}
            <View className="flex-row items-center justify-between py-3.5">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-9 h-9 rounded-[12px] bg-indigo-50 items-center justify-center mr-3">
                  <VolumeHigh size={20} color="#4F46E5" variant="Linear" />
                </View>
                <View className="flex-1">
                  <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                    Sound Effects
                  </Text>
                  <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                    Chime on attendance marking and fees
                  </Text>
                </View>
              </View>
              <FigmaSwitch
                value={soundEffects}
                onValueChange={() => handleToggle(setSoundEffects, soundEffects)}
              />
            </View>
          </View>
        </Animated.View>

        {/* Section 3: Training & Session Defaults */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionHeading} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Session & Attendance Defaults
          </Text>
          <View
            style={[styles.BoxStyle2, { padding: 18 }]}
            className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
          >
            {/* Default Class Duration */}
            <View className="pb-3 border-b border-[#F2EEF4]">
              <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937] mb-1">
                Default Batch Duration
              </Text>
              <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280] mb-3">
                Standard training time applied when creating new batches
              </Text>

              {/* Duration Pills */}
              <View className="flex-row gap-2.5">
                {(['60', '90', '120'] as const).map((dur) => {
                  const isSelected = selectedDuration === dur;
                  return (
                    <TouchableOpacity
                      key={dur}
                      activeOpacity={0.7}
                      onPress={() => handleDurationSelect(dur)}
                      className={`flex-1 py-2.5 rounded-[14px] items-center justify-center border ${
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
                        {dur} Mins
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Auto-mark Absent */}
            <View className="flex-row items-center justify-between pt-3.5 border-b border-[#F2EEF4]">
              <View className="flex-1 mr-3">
                <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                  Auto-mark Absent on Exit
                </Text>
                <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                  Unmarked students marked absent on session end
                </Text>
              </View>
              <FigmaSwitch
                value={autoMarkAbsent}
                onValueChange={() => handleToggle(setAutoMarkAbsent, autoMarkAbsent)}
              />
            </View>

            {/* Offline Sync */}
            <View className="flex-row items-center justify-between pt-3.5">
              <View className="flex-1 mr-3">
                <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                  Offline Coaching Mode
                </Text>
                <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                  Cache student rosters for training without internet
                </Text>
              </View>
              <FigmaSwitch
                value={offlineSync}
                onValueChange={() => handleToggle(setOfflineSync, offlineSync)}
              />
            </View>
          </View>
        </Animated.View>

        {/* Section 4: Storage & Reset */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} className="mb-5">
          <Text style={fontStyles.sectionHeading} className="text-[16px] text-[#1F2937] mb-3 px-1">
            Storage & Data
          </Text>
          <View
            style={[styles.BoxStyle2, { paddingHorizontal: 16, paddingVertical: 6 }]}
            className="bg-[#FDFDFD] border border-[#F2EEF4] rounded-[24px]"
          >
            {/* Clear Cache */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowClearCacheModal(true)}
              disabled={isClearingCache || cacheSize === '0.0 KB'}
              className="flex-row items-center py-3.5 border-b border-[#F2EEF4]"
            >
              <View className="w-9 h-9 rounded-[12px] bg-amber-50 items-center justify-center mr-3">
                <Trash size={20} color="#D97706" variant="Linear" />
              </View>
              <View className="flex-1">
                <Text style={fontStyles.itemTitle} className="text-[14px] text-[#1F2937]">
                  Clear Cached Data
                </Text>
                <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                  Temporary images and query cache
                </Text>
              </View>
              <View className="bg-[#F3F4F6] px-2.5 py-1 rounded-full">
                <Text style={fontStyles.badgeText} className="text-[11px] text-[#4B5563]">
                  {cacheSize}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Reset Preferences */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResetPreferences}
              className="flex-row items-center py-3.5"
            >
              <View className="w-9 h-9 rounded-[12px] bg-red-50 items-center justify-center mr-3">
                <Refresh2 size={20} color="#EF4444" variant="Linear" />
              </View>
              <View className="flex-1">
                <Text style={[fontStyles.itemTitle, { color: '#EF4444' }]} className="text-[14px]">
                  Reset All Settings
                </Text>
                <Text style={fontStyles.itemSubtitle} className="text-[12px] text-[#6B7280]">
                  Restore default configurations
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer info */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} className="items-center mt-2 mb-8">
          <Text style={fontStyles.footerText} className="text-[12px] text-[#9CA3AF]">
            Settings are automatically synced across your coach devices.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Clear Cache Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showClearCacheModal}
        title="Clear Cache & Temp Files?"
        message={`Are you sure you want to delete ${cacheSize} of cached images and offline temporary data? Your student and attendance records will remain safe.`}
        confirmText="Clear Cache"
        cancelText="Cancel"
        onClose={() => setShowClearCacheModal(false)}
        onConfirm={handleClearCacheConfirm}
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
  sectionHeading: {
    fontFamily: 'Urbanist_700Bold',
  },
  itemTitle: {
    fontFamily: 'Urbanist_700Bold',
  },
  itemSubtitle: {
    fontFamily: 'Urbanist_500Medium',
  },
  pillText: {
    fontFamily: 'Urbanist_700Bold',
  },
  badgeText: {
    fontFamily: 'Urbanist_600SemiBold',
  },
  footerText: {
    fontFamily: 'Urbanist_500Medium',
  },
});
