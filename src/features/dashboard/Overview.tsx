import StatsCard from "@/components/ui/StatsCard";
import React from "react";
import { Text, View } from "react-native";
import { DashboardOverviewData } from "@/types/dashboard";
import { OverviewSkeleton } from "@/components/ui/Skeleton";

export interface OverviewProps {
  overview?: DashboardOverviewData | any;
  isLoading?: boolean;
}

export default function Overview({ overview, isLoading = false }: OverviewProps) {
  if (isLoading && !overview) {
    return <OverviewSkeleton />;
  }

  // Determine if overview is for Batches Screen (has total_batches & no fees object)
  const isBatchesOverview =
    overview &&
    overview.total_batches !== undefined &&
    overview.fees === undefined;

  // -------------------------------------------------------------
  // BATCHES SCREEN OVERVIEW MODE (Custom Order for Batches Screen)
  // -------------------------------------------------------------
  if (isBatchesOverview) {
    // Card 1: Total Batches (Purple)
    const totalBatchesVal = String(overview.total_batches ?? 0);
    const newBatchesSubtitle = `${overview.new_batches_this_month ?? 0} New This Month`;

    // Card 2: Total Students (Peach)
    const totalStudentsVal = String(overview.students?.total ?? 0);
    const totalStudentsSubtitle = "Across All Batches";

    // Card 3: Today's Sessions (Blue) -> "completed": 6 / "scheduled": 13, Subtitle: "Remaining 7"
    const sessionsCompleted = String(overview.todays_sessions?.completed ?? 0).padStart(2, "0");
    const sessionsScheduled = String(overview.todays_sessions?.scheduled ?? 0);
    const remainingActive =
      overview.todays_sessions?.total_active_sessions !== undefined
        ? overview.todays_sessions.total_active_sessions
        : Math.max(
            0,
            (overview.todays_sessions?.scheduled ?? 0) -
              (overview.todays_sessions?.completed ?? 0)
          );
    const sessionsSubtitle = `Remaining Sessions ${remainingActive}`;

    // Card 4: Today's Attendance (Green) -> "present": 11 / "total_expected": 40, Subtitle: "27.5% Attendance"
    const attendancePresent = String(overview.todays_attendance?.present ?? 0);
    const attendanceExpected = String(overview.todays_attendance?.total_expected ?? 0);
    const attendancePercent = `${overview.todays_attendance?.percentage ?? 0}% Attendance`;

    return (
      <View className="w-full">
        {/* Overview Header */}
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight">
            Overview
          </Text>
        </View>

        {/* 2x2 Grid of Stats Cards */}
        <View className="flex-row gap-3.5 mb-3.5">
          {/* Card 1: Total Batches (Purple) */}
          <View className="flex-1">
            <StatsCard
              title="Total Batches"
              value={totalBatchesVal}
              subtitle={newBatchesSubtitle}
              variant="purple"
            />
          </View>

          {/* Card 2: Total Students (Peach) */}
          <View className="flex-1">
            <StatsCard
              title="Total Students"
              value={totalStudentsVal}
              subtitle={totalStudentsSubtitle}
              variant="peach"
            />
          </View>
        </View>

        <View className="flex-row gap-3.5">
          {/* Card 3: Today's Sessions (Blue) */}
          <View className="flex-1">
            <StatsCard
              title="Today's Sessions"
              value={sessionsCompleted}
              valueSuffix={`/ ${sessionsScheduled}`}
              subtitle={sessionsSubtitle}
              variant="blue"
            />
          </View>

          {/* Card 4: Today's Attendance (Green) */}
          <View className="flex-1">
            <StatsCard
              title="Today's Attendance"
              value={attendancePresent}
              valueSuffix={`/ ${attendanceExpected}`}
              subtitle={attendancePercent}
              variant="green"
            />
          </View>
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------
  // DASHBOARD SCREEN OVERVIEW MODE (Restored Original Dashboard Layout)
  // -------------------------------------------------------------
  // 1. Total Students (Purple Card)
  const totalStudents = overview
    ? String(overview.students?.total ?? overview.total_students ?? 0)
    : "0";
  const newStudentsSubtitle = overview
    ? overview.students?.new_this_month !== undefined
      ? `${overview.students.new_this_month} new this month`
      : "0 new this month"
    : "0 new this month";

  // 2. Today's Sessions (Peach Card) -> "completed": 6 / "scheduled": 13, Subtitle: "Remaining 7"
  const todaysSessionsCompleted = overview?.todays_sessions?.completed !== undefined
    ? String(overview.todays_sessions.completed).padStart(2, "0")
    : String(overview?.attendance?.present_today ?? 0).padStart(2, "0");

  const todaysSessionsScheduled = overview?.todays_sessions?.scheduled !== undefined
    ? String(overview.todays_sessions.scheduled)
    : String(overview?.attendance?.total_expected ?? 0);

  const remainingActive = overview?.todays_sessions?.total_active_sessions !== undefined
    ? overview.todays_sessions.total_active_sessions
    : overview?.todays_sessions?.scheduled !== undefined && overview?.todays_sessions?.completed !== undefined
    ? Math.max(0, overview.todays_sessions.scheduled - overview.todays_sessions.completed)
    : 0;

  const todaysSessionsSubtitle = overview?.todays_sessions?.completed !== undefined
    ? `Remaining Sessions ${remainingActive}`
    : `${overview?.attendance?.percentage ?? 0}% Attendance`;

  // 3. Today's Attendance (Blue Card)
  const attendancePresent = overview
    ? String(
        overview.todays_attendance?.present ??
          overview.attendance?.present_today ??
          0
      )
    : "0";
  const attendanceTotal = overview
    ? String(
        overview.todays_attendance?.total_expected ??
          overview.attendance?.total_expected ??
          0
      )
    : "0";
  const attendanceSubtitle = overview
    ? `${
        overview.todays_attendance?.percentage ??
        overview.attendance?.percentage ??
        0
      }% Attendance`
    : "0% Attendance";

  // 4. Pending Fees (Green Card)
  const pendingAmount = overview?.fees?.pending_amount !== undefined
    ? `₹${overview.fees.pending_amount.toLocaleString("en-IN")}`
    : "₹0";
  const studentsDueSubtitle = overview?.fees?.students_due !== undefined
    ? `${overview.fees.students_due} students due`
    : "Across All Batches";

  return (
    <View className="w-full">
      {/* Overview Header */}
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-[24px] font-urbanist-bold text-primary tracking-tight">
          Overview
        </Text>
      </View>

      {/* 2x2 Grid of Stats Cards */}
      <View className="flex-row gap-3.5 mb-3.5">
        {/* Total Students Card (Purple) */}
        <View className="flex-1">
          <StatsCard
            title="Total Students"
            value={totalStudents}
            subtitle={newStudentsSubtitle}
            variant="purple"
          />
        </View>
        {/* Today's Sessions Card (Peach) */}
        <View className="flex-1">
          <StatsCard
            title="Today's Sessions"
            value={todaysSessionsCompleted}
            valueSuffix={`/ ${todaysSessionsScheduled}`}
            subtitle={todaysSessionsSubtitle}
            variant="peach"
          />
        </View>
      </View>

      <View className="flex-row gap-3.5">
        {/* Today's Attendance Card (Blue) */}
        <View className="flex-1">
          <StatsCard
            title="Today's Attendance"
            value={attendancePresent}
            valueSuffix={`/ ${attendanceTotal}`}
            subtitle={attendanceSubtitle}
            variant="blue"
          />
        </View>
        {/* Pending Fees Card (Green) */}
        <View className="flex-1">
          <StatsCard
            title="Pending Fees"
            value={pendingAmount}
            subtitle={studentsDueSubtitle}
            variant="green"
          />
        </View>
      </View>
    </View>
  );
}