import React from 'react';
import { View } from 'react-native';
import StatsCard from '@/components/ui/StatsCard';

export interface AllStudentsStatCardsProps {
  overview?: {
    total_students?: number;
    new_this_month?: number;
    boys_count?: number;
    boys_percent?: number;
    girls_count?: number;
    girls_percent?: number;
    pending_fees_count?: number;
  };
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
  overview,
  totalStudents: propTotalStudents,
  newThisMonth: propNewThisMonth,
  boysCount: propBoysCount,
  boysPercent: propBoysPercent,
  girlsCount: propGirlsCount,
  girlsPercent: propGirlsPercent,
  pendingFeesCount: propPendingFeesCount,
  onTotalPress,
  onBoysPress,
  onGirlsPress,
  onPendingFeesPress,
}: AllStudentsStatCardsProps) {
  const totalStudents = overview?.total_students ?? propTotalStudents ?? 0;
  const newThisMonth = overview?.new_this_month ?? propNewThisMonth ?? 0;
  const boysCount = overview?.boys_count ?? propBoysCount ?? 0;
  const boysPercent = overview?.boys_percent ?? propBoysPercent ?? 0;
  const girlsCount = overview?.girls_count ?? propGirlsCount ?? 0;
  const girlsPercent = overview?.girls_percent ?? propGirlsPercent ?? 0;
  const pendingFeesCount = overview?.pending_fees_count ?? propPendingFeesCount ?? 0;
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
