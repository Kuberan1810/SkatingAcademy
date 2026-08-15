import StatsCard from "@/components/ui/StatsCard";
import React from "react";
import { Text, View } from "react-native";
import { BatchesOverviewData } from "@/types/batch";
import { OverviewSkeleton } from "@/components/ui/Skeleton";

export interface OverviewProps {
    overview?: BatchesOverviewData;
    isLoading?: boolean;
}

export default function Overview({ overview, isLoading = false }: OverviewProps) {
    if (isLoading && !overview) {
        return <OverviewSkeleton />;
    }

    const totalBatches = overview ? String(overview.total_batches) : "0";
    const newBatchesSubtitle = overview
        ? `${overview.new_batches_this_month} New This Month`
        : "0 New This Month";

    const todaysSessionsScheduled = overview
        ? String(overview.todays_sessions.scheduled).padStart(2, "0")
        : "00";
    const todaysSessionsTotal = overview
        ? String(overview.todays_sessions.total_active_sessions || overview.total_batches)
        : "0";
    const todaysSessionsSubtitle = overview
        ? `${overview.todays_sessions.completed} Completed`
        : "0 Completed";

    const totalStudents = overview ? String(overview.students.total) : "0";

    const attendancePresent = overview ? overview.todays_attendance.present : 0;
    const attendanceTotal = overview ? overview.todays_attendance.total_expected : 0;
    const attendancePercentage = overview ? overview.todays_attendance.percentage : 0;
    const attendanceValue = `${attendancePresent} / ${attendanceTotal}`;
    const attendanceSubtitle = `${attendancePercentage}% Present`;

    return (
        <View>
            {/* Overview Header */}
            <View className="flex-row items-center justify-between mb-5">
                <Text className="text-[24px] font-urbanist-bold text-primary">
                    Overview
                </Text>
            </View>

            {/* 2x2 Grid of Stats Cards */}
            <View className="flex-row gap-3.5 mb-3.5">
                <View className="flex-1">
                    <StatsCard
                        title="Total Batches"
                        value={totalBatches}
                        subtitle={newBatchesSubtitle}
                        variant="purple"
                    />
                </View>
                <View className="flex-1">
                    <StatsCard
                        title="Today's Sessions"
                        value={todaysSessionsScheduled}
                        valueSuffix={todaysSessionsTotal ? `/ ${todaysSessionsTotal}` : undefined}
                        subtitle={todaysSessionsSubtitle}
                        variant="peach"
                    />
                </View>
            </View>

            <View className="flex-row gap-3.5">
                <View className="flex-1">
                    <StatsCard
                        title="Students"
                        value={totalStudents}
                        subtitle="Across All Batches"
                        variant="blue"
                    />
                </View>
                <View className="flex-1">
                    <StatsCard
                        title="Today's Attendance"
                        value={attendanceValue}
                        subtitle={attendanceSubtitle}
                        variant="green"
                    />
                </View>
            </View>
        </View>
    );
}