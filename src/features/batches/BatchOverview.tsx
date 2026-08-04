import StatsCard from "@/components/ui/StatsCard"
import React from "react"
import { Text, View } from "react-native"

export default function Overview() {
    return (
        <View>
            
            {/* Overview Header */}
            <Text className="text-[24px] font-urbanist-bold text-primary mb-5">
                Overview
            </Text>

            {/* 2x2 Grid of Stats Cards */}
            <View className="flex-row gap-3.5 mb-3.5">
                <View className="flex-1">
                    <StatsCard
                        title="Total Students"
                        value="26"
                        subtitle="18 new this month"
                        variant="purple"
                    />
                </View>
                <View className="flex-1">
                    <StatsCard
                        title="Present Today"
                        value="26"
                        valueSuffix="/ 126"
                        subtitle="76 % Attendance"
                        variant="peach"
                    />
                </View>
            </View>

            <View className="flex-row gap-3.5">
                <View className="flex-1">
                    <StatsCard
                        title="Pending Fess"
                        value="₹18,500"
                        subtitle="12 students due"
                        variant="blue"
                    />
                </View>
                <View className="flex-1">
                    <StatsCard
                        title="Total Revenue"
                        value="₹82,400"
                        subtitle="+18% from last month"
                        variant="green"
                    />
                </View>
            </View>
        </View>
    )
}