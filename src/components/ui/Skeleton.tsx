import React, { useEffect } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export default function Skeleton({
  width,
  height,
  borderRadius = 16,
  style,
  className = '',
}: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
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

export function OverviewSkeleton() {
  return (
    <View className="gap-3.5 mb-5">
      <Skeleton width={120} height={24} borderRadius={6} className="mb-2" />
      <View className="flex-row gap-3.5">
        <Skeleton height={110} borderRadius={20} className="flex-1" />
        <Skeleton height={110} borderRadius={20} className="flex-1" />
      </View>
      <View className="flex-row gap-3.5">
        <Skeleton height={110} borderRadius={20} className="flex-1" />
        <Skeleton height={110} borderRadius={20} className="flex-1" />
      </View>
    </View>
  );
}

export function BatchCardSkeleton() {
  return (
    <View className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 gap-3.5 mb-4">
      <View className="flex-row items-center justify-between">
        <Skeleton width={160} height={20} borderRadius={6} />
        <Skeleton width={28} height={28} borderRadius={14} />
      </View>
      <View className="flex-row items-center gap-3">
        <Skeleton width={90} height={16} borderRadius={6} />
        <Skeleton width={100} height={16} borderRadius={6} />
      </View>
      <View className="flex-row items-center justify-between pt-1">
        <Skeleton width={80} height={18} borderRadius={6} />
        <Skeleton width={100} height={38} borderRadius={12} />
      </View>
    </View>
  );
}

export function StudentCardSkeleton() {
  return (
    <View className="p-4 border border-[#E5E7EB] rounded-[28px] bg-white gap-3.5 mb-3.5">
      {/* Top Header Row */}
      <View className="flex-row items-center justify-between">
        <Skeleton width={150} height={32} borderRadius={12} />
        <Skeleton width={30} height={30} borderRadius={8} />
      </View>

      {/* Middle Row: Avatar & Text Lines & Call Button */}
      <View className="flex-row items-center justify-between my-1">
        <View className="flex-row items-center flex-1 gap-3">
          <Skeleton width={42} height={42} borderRadius={21} />
          <View className="gap-2 flex-1">
            <Skeleton width={130} height={18} borderRadius={6} />
            <Skeleton width={170} height={14} borderRadius={6} />
          </View>
        </View>
        <Skeleton width={42} height={42} borderRadius={15} />
      </View>

      {/* Bottom Row: Status Badges */}
      <View className="flex-row items-center gap-2">
        <Skeleton width={120} height={28} borderRadius={14} />
        <Skeleton width={80} height={28} borderRadius={14} />
      </View>
    </View>
  );
}

export function CompletedStudentCardSkeleton() {
  return (
    <View className="bg-white rounded-[28px] p-3.5 border border-[#E5E7EB] flex-row items-center justify-between mb-3.5">
      {/* Left: Avatar & Info */}
      <View className="flex-row items-center flex-1 gap-3.5">
        <Skeleton width={40} height={40} borderRadius={20} />
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2.5">
            <Skeleton width={110} height={16} borderRadius={6} />
            <Skeleton width={58} height={20} borderRadius={10} />
          </View>
          <Skeleton width={85} height={13} borderRadius={6} />
        </View>
      </View>
      {/* Right: Ratio Badge */}
      <Skeleton width={75} height={28} borderRadius={14} />
    </View>
  );
}

export function CompletedClassHeaderSkeleton() {
  return (
    <View className="gap-3.5 mb-6">
      {/* Date Pill Skeleton */}
      <Skeleton width={160} height={34} borderRadius={12} className="mb-1" />
      {/* Title & Subtitle Skeleton */}
      <Skeleton width={240} height={28} borderRadius={8} />
      <Skeleton width={280} height={16} borderRadius={6} />
      {/* Stat Cards Row Skeleton */}
      <View className="flex-row gap-3 mt-3">
        <Skeleton height={90} borderRadius={24} className="flex-1" />
        <Skeleton height={90} borderRadius={24} className="flex-1" />
        <Skeleton height={90} borderRadius={24} className="flex-1" />
      </View>
    </View>
  );
}

export function StudentProfileSkeleton() {
  return (
    <View className="flex-1 px-5 gap-4 pt-2">
      {/* Student Summary Top Card Skeleton */}
      <Skeleton height={120} borderRadius={28} />

      {/* Action Buttons Row Skeleton */}
      <View className="flex-row gap-3">
        <Skeleton height={48} borderRadius={16} className="flex-1" />
        <Skeleton height={48} borderRadius={16} className="flex-1" />
        <Skeleton height={48} borderRadius={16} className="flex-1" />
      </View>

      {/* Segmented Tab Switcher Skeleton */}
      <Skeleton height={48} borderRadius={24} className="my-1" />

      {/* Tab Content Cards Skeleton */}
      <Skeleton height={140} borderRadius={28} />
      <Skeleton height={140} borderRadius={28} />
      <Skeleton height={120} borderRadius={28} />
    </View>
  );
}

export function FeeCardSkeleton() {
  return (
    <View className="bg-white rounded-[28px] border border-[#E5E7EB] p-4 gap-3 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 gap-3">
          <Skeleton width={40} height={40} borderRadius={20} />
          <View className="gap-2 flex-1">
            <Skeleton width={120} height={16} borderRadius={6} />
            <Skeleton width={90} height={12} borderRadius={6} />
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Skeleton width={40} height={40} borderRadius={15} />
          <Skeleton width={90} height={40} borderRadius={14} />
        </View>
      </View>
      <Skeleton width={130} height={26} borderRadius={13} />
    </View>
  );
}
