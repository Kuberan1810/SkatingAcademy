import React from 'react';
import { View } from 'react-native';
import StatsCard from '@/components/ui/StatsCard';

export interface AllStudentsStatCardsProps {
  totalStudents?: number;
  newThisMonth?: number;
  boysCount?: number;
  boysPercent?: number;
  girlsCount?: number;
  girlsPercent?: number;
  pendingFeesCount?: number;
  onTotalPress?: () => void;
  onBoysPress?: () => void;
  onGirlsPress?: () => void;
  onPendingFeesPress?: () => void;
}

export default function AllStudentsStatCards({
  totalStudents = 26,
  newThisMonth = 18,
  boysCount = 72,
  boysPercent = 57,
  girlsCount = 54,
  girlsPercent = 43,
  pendingFeesCount = 7,
  onTotalPress,
  onBoysPress,
  onGirlsPress,
  onPendingFeesPress,
}: AllStudentsStatCardsProps) {
  return (
    <View className="gap-3.5 mb-6">
      {/* Row 1: Total Students & Boys */}
      <View className="flex-row items-center gap-3.5">
        <View className="flex-1">
          <StatsCard
            title="Total Students"
            value={totalStudents}
            subtitle={`${newThisMonth} new this month`}
            variant="purple"
            onPress={onTotalPress}
          />
        </View>
        <View className="flex-1">
          <StatsCard
            title="Boys"
            value={boysCount}
            subtitle={`${boysPercent}% of total students`}
            variant="peach"
            onPress={onBoysPress}
          />
        </View>
      </View>

      {/* Row 2: Girls & Pending Fees */}
      <View className="flex-row items-center gap-3.5">
        <View className="flex-1">
          <StatsCard
            title="Girls"
            value={girlsCount}
            subtitle={`${girlsPercent}% of total students`}
            variant="blue"
            onPress={onGirlsPress}
          />
        </View>
        <View className="flex-1">
          <StatsCard
            title="Pending Fees"
            value={pendingFeesCount}
            subtitle="Students"
            variant="green"
            onPress={onPendingFeesPress}
          />
        </View>
      </View>
    </View>
  );
}
