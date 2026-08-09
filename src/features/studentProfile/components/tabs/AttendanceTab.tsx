import React from 'react';
import { View } from 'react-native';
import AttendanceStatCard from '../ui/AttendanceStatCard';
import AttendanceCalendarGrid from '../ui/AttendanceCalendarGrid';
import { AttendanceStats, AttendanceDayItem } from '../../types';

export interface AttendanceTabProps {
  stats: AttendanceStats;
  attendanceGrid: AttendanceDayItem[];
}

export default function AttendanceTab({
  stats,
  attendanceGrid,
}: AttendanceTabProps) {
  return (
    <View className="w-full">
      {/* 3 Stat Cards Row */}
      <View className="flex-row items-center gap-3 mb-6">
        <AttendanceStatCard type="present" value={stats.present < 10 ? `0${stats.present}` : stats.present} />
        <AttendanceStatCard type="absent" value={stats.absent < 10 ? `0${stats.absent}` : stats.absent} />
        <AttendanceStatCard type="attendance" value={stats.attendancePercent} />
      </View>

      {/* Monthly Attendance Calendar Matrix */}
      <AttendanceCalendarGrid
        days={attendanceGrid}
        scheduledDaysCount={stats.scheduledDaysCount}
      />
    </View>
  );
}
