import React, { createContext, useContext, useEffect } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const SkeletonPulseContext = createContext<SharedValue<number> | null>(null);

/**
 * SkeletonGroup provides a single shared animation driver for all child Skeleton components.
 * This drastically reduces CPU/GPU overhead from 30+ separate animation timers to 1 single timer.
 */
export function SkeletonGroup({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, {
        duration: 650,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  return (
    <SkeletonPulseContext.Provider value={opacity}>
      {children}
    </SkeletonPulseContext.Provider>
  );
}

function SkeletonComponent({
  width,
  height,
  borderRadius = 16,
  style,
  className = '',
}: SkeletonProps) {
  const contextOpacity = useContext(SkeletonPulseContext);
  const localOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (!contextOpacity) {
      localOpacity.value = withRepeat(
        withTiming(0.9, {
          duration: 650,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [contextOpacity, localOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: contextOpacity ? contextOpacity.value : localOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: '#E2E8F0',
        },
        animatedStyle,
        style,
      ]}
      className={className}
    />
  );
}

export default React.memo(SkeletonComponent);

export function OverviewSkeleton() {
  return (
    <View className="gap-3.5 mb-5">
      <SkeletonComponent width={120} height={24} borderRadius={8} className="mb-1" />
      <View className="flex-row gap-3.5">
        <SkeletonComponent height={110} borderRadius={22} className="flex-1" />
        <SkeletonComponent height={110} borderRadius={22} className="flex-1" />
      </View>
      <View className="flex-row gap-3.5">
        <SkeletonComponent height={110} borderRadius={22} className="flex-1" />
        <SkeletonComponent height={110} borderRadius={22} className="flex-1" />
      </View>
    </View>
  );
}

export function BatchCardSkeleton() {
  return (
    <View className="bg-white rounded-[28px] border border-[#E5E7EB] p-5 gap-3.5 mb-4">
      <View className="flex-row items-center justify-between">
        <SkeletonComponent width={160} height={22} borderRadius={8} />
        <SkeletonComponent width={32} height={32} borderRadius={10} />
      </View>
      <View className="flex-row items-center gap-3">
        <SkeletonComponent width={100} height={18} borderRadius={8} />
        <SkeletonComponent width={110} height={18} borderRadius={8} />
      </View>
      <View className="pt-2">
        <SkeletonComponent height={48} borderRadius={18} className="w-full" />
      </View>
    </View>
  );
}

export function StudentCardSkeleton() {
  return (
    <View className="p-4 border border-[#E5E7EB] rounded-[28px] bg-white gap-3.5 mb-3.5">
      {/* Top Header Row */}
      <View className="flex-row items-center justify-between">
        <SkeletonComponent width={150} height={32} borderRadius={12} />
        <SkeletonComponent width={30} height={30} borderRadius={8} />
      </View>

      {/* Middle Row: Avatar & Text Lines & Call Button */}
      <View className="flex-row items-center justify-between my-1">
        <View className="flex-row items-center flex-1 gap-3">
          <SkeletonComponent width={42} height={42} borderRadius={21} />
          <View className="gap-2 flex-1">
            <SkeletonComponent width={130} height={18} borderRadius={6} />
            <SkeletonComponent width={170} height={14} borderRadius={6} />
          </View>
        </View>
        <SkeletonComponent width={42} height={42} borderRadius={15} />
      </View>

      {/* Bottom Row: Status Badges */}
      <View className="flex-row items-center gap-2">
        <SkeletonComponent width={120} height={28} borderRadius={14} />
        <SkeletonComponent width={80} height={28} borderRadius={14} />
      </View>
    </View>
  );
}

export function UpcomingSessionsSkeleton() {
  return (
    <View className="bg-white rounded-[28px] border border-[#E5E7EB] p-4 gap-3.5 mb-3.5">
      <View className="flex-row items-center justify-between">
        <SkeletonComponent width={140} height={22} borderRadius={8} />
        <SkeletonComponent width={90} height={34} borderRadius={16} />
      </View>
      <View className="flex-row items-center justify-between pt-1">
        <SkeletonComponent width={120} height={16} borderRadius={6} />
        <SkeletonComponent width={90} height={16} borderRadius={6} />
      </View>
    </View>
  );
}

export function PendingFeeSkeleton() {
  return (
    <View className="bg-white rounded-[28px] border border-[#E5E7EB] p-4 gap-3 mb-3.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-3">
          <SkeletonComponent width={42} height={42} borderRadius={21} />
          <View className="gap-1.5 flex-1">
            <SkeletonComponent width={130} height={16} borderRadius={6} />
            <SkeletonComponent width={100} height={13} borderRadius={6} />
          </View>
        </View>
        <SkeletonComponent width={40} height={40} borderRadius={14} />
      </View>
      <View className="flex-row items-center justify-between pt-2 border-t border-[#F3F4F6]">
        <SkeletonComponent width={110} height={18} borderRadius={6} />
        <SkeletonComponent width={80} height={30} borderRadius={12} />
      </View>
    </View>
  );
}

export function FeeCardSkeleton() {
  return (
    <View className="bg-white rounded-[28px] border border-[#E5E7EB] p-4 gap-3 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-3">
          <SkeletonComponent width={40} height={40} borderRadius={20} />
          <View className="gap-2 flex-1">
            <SkeletonComponent width={120} height={16} borderRadius={6} />
            <SkeletonComponent width={90} height={12} borderRadius={6} />
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <SkeletonComponent width={40} height={40} borderRadius={15} />
          <SkeletonComponent width={90} height={40} borderRadius={14} />
        </View>
      </View>
      <SkeletonComponent width={130} height={26} borderRadius={13} />
    </View>
  );
}

export function RecentPaymentSkeleton() {
  return (
    <View className="p-3 border border-[#E5E7EB] rounded-[28px] bg-white flex-row items-center justify-between mb-3">
      <View className="flex-row items-center flex-1 gap-3">
        <SkeletonComponent width={40} height={40} borderRadius={20} />
        <View className="gap-1.5 flex-1">
          <SkeletonComponent width={120} height={16} borderRadius={6} />
          <SkeletonComponent width={90} height={13} borderRadius={6} />
        </View>
      </View>
      <SkeletonComponent width={70} height={24} borderRadius={8} />
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <SkeletonGroup>
      <View className="gap-4">
        {/* Overview Stats Grid */}
        <OverviewSkeleton />

        {/* Upcoming Sessions Section */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-3">
            <SkeletonComponent width={170} height={22} borderRadius={8} />
            <SkeletonComponent width={70} height={26} borderRadius={12} />
          </View>
          <UpcomingSessionsSkeleton />
          <UpcomingSessionsSkeleton />
        </View>

        {/* Pending Fee Section */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-3">
            <SkeletonComponent width={190} height={22} borderRadius={8} />
            <SkeletonComponent width={70} height={26} borderRadius={12} />
          </View>
          <PendingFeeSkeleton />
          <PendingFeeSkeleton />
        </View>
      </View>
    </SkeletonGroup>
  );
}

export function BatchesPageSkeleton() {
  return (
    <SkeletonGroup>
      <View className="gap-4">
        <OverviewSkeleton />
        <View className="flex-row items-center justify-between mt-2 mb-1">
          <SkeletonComponent width={130} height={22} borderRadius={8} />
        </View>
        <View className="flex-row gap-2 mb-3">
          <SkeletonComponent width={65} height={34} borderRadius={17} />
          <SkeletonComponent width={85} height={34} borderRadius={17} />
          <SkeletonComponent width={80} height={34} borderRadius={17} />
          <SkeletonComponent width={80} height={34} borderRadius={17} />
        </View>
        <BatchCardSkeleton />
        <BatchCardSkeleton />
        <BatchCardSkeleton />
      </View>
    </SkeletonGroup>
  );
}

export function StudentsPageSkeleton() {
  return (
    <SkeletonGroup>
      <View className="gap-4">
        <OverviewSkeleton />
        <View className="flex-row gap-2 mt-2 mb-3">
          <SkeletonComponent width={65} height={34} borderRadius={17} />
          <SkeletonComponent width={80} height={34} borderRadius={17} />
          <SkeletonComponent width={90} height={34} borderRadius={17} />
        </View>
        <StudentCardSkeleton />
        <StudentCardSkeleton />
        <StudentCardSkeleton />
      </View>
    </SkeletonGroup>
  );
}

export function FeesPageSkeleton() {
  return (
    <SkeletonGroup>
      <View className="gap-4">
        {/* Overview Stats */}
        <OverviewSkeleton />

        {/* Student List Section */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-3">
            <SkeletonComponent width={130} height={22} borderRadius={8} />
            <SkeletonComponent width={70} height={26} borderRadius={12} />
          </View>
          <View className="flex-row gap-2 mb-3">
            <SkeletonComponent width={60} height={32} borderRadius={16} />
            <SkeletonComponent width={70} height={32} borderRadius={16} />
            <SkeletonComponent width={80} height={32} borderRadius={16} />
            <SkeletonComponent width={80} height={32} borderRadius={16} />
          </View>
          <FeeCardSkeleton />
          <FeeCardSkeleton />
          <FeeCardSkeleton />
        </View>

        {/* Recent Payments Section */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-3">
            <SkeletonComponent width={150} height={22} borderRadius={8} />
            <SkeletonComponent width={70} height={26} borderRadius={12} />
          </View>
          <RecentPaymentSkeleton />
          <RecentPaymentSkeleton />
        </View>
      </View>
    </SkeletonGroup>
  );
}

export function CompletedStudentCardSkeleton() {
  return (
    <View className="bg-white rounded-[28px] p-3.5 border border-[#E5E7EB] flex-row items-center justify-between mb-3.5">
      {/* Left: Avatar & Info */}
      <View className="flex-row items-center flex-1 gap-3.5">
        <SkeletonComponent width={40} height={40} borderRadius={20} />
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2.5">
            <SkeletonComponent width={110} height={16} borderRadius={6} />
            <SkeletonComponent width={58} height={20} borderRadius={10} />
          </View>
          <SkeletonComponent width={85} height={13} borderRadius={6} />
        </View>
      </View>
      {/* Right: Ratio Badge */}
      <SkeletonComponent width={75} height={28} borderRadius={14} />
    </View>
  );
}

export function CompletedClassHeaderSkeleton() {
  return (
    <SkeletonGroup>
      <View className="gap-3.5 mb-6">
        {/* Date Pill Skeleton */}
        <SkeletonComponent width={160} height={34} borderRadius={12} className="mb-1" />
        {/* Title & Subtitle Skeleton */}
        <SkeletonComponent width={240} height={28} borderRadius={8} />
        <SkeletonComponent width={280} height={16} borderRadius={6} />
        {/* Stat Cards Row Skeleton */}
        <View className="flex-row gap-3 mt-3">
          <SkeletonComponent height={90} borderRadius={24} className="flex-1" />
          <SkeletonComponent height={90} borderRadius={24} className="flex-1" />
          <SkeletonComponent height={90} borderRadius={24} className="flex-1" />
        </View>
      </View>
    </SkeletonGroup>
  );
}

export function StudentProfileSkeleton() {
  return (
    <SkeletonGroup>
      <View className="flex-1 px-5 gap-4 pt-2">
        {/* Student Summary Top Card Skeleton */}
        <SkeletonComponent height={120} borderRadius={28} />

        {/* Action Buttons Row Skeleton */}
        <View className="flex-row gap-3">
          <SkeletonComponent height={48} borderRadius={16} className="flex-1" />
          <SkeletonComponent height={48} borderRadius={16} className="flex-1" />
          <SkeletonComponent height={48} borderRadius={16} className="flex-1" />
        </View>

        {/* Segmented Tab Switcher Skeleton */}
        <SkeletonComponent height={48} borderRadius={24} className="my-1" />

        {/* Tab Content Cards Skeleton */}
        <SkeletonComponent height={140} borderRadius={28} />
        <SkeletonComponent height={140} borderRadius={28} />
        <SkeletonComponent height={120} borderRadius={28} />
      </View>
    </SkeletonGroup>
  );
}
