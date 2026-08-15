import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import StartClassOverview from '@/features/batches/startCLass/StartClassOverview';
import { SessionData } from '@/api/sessions.api';
import { StudentData } from '@/features/batches/startCLass/StudentAttendanceCard';

const formatShortTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const str = timeStr.trim();
  const parts = str.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return str;
};

export default function StartClassScreen() {
  const params = useLocalSearchParams<any>();

  let parsedSession: SessionData | null = null;
  if (params.sessionData) {
    try {
      parsedSession = typeof params.sessionData === 'string'
        ? JSON.parse(params.sessionData)
        : params.sessionData;
    } catch (e) {
      console.log('Error parsing sessionData in start-class route:', e);
    }
  }

  const mappedStudents: StudentData[] = (parsedSession?.students || []).map((s) => ({
    id: String(s.id),
    name: s.full_name,
    batchName: s.batch_name || parsedSession?.batch_name || 'Batch',
    avatar: s.avatar_uri || undefined,
    attendanceStatus: (s.attendance_status as any) || undefined,
    attendedClasses: s.attended_classes ?? 0,
    conductedClasses: s.conducted_classes ?? 0,
  }));

  const startTime = formatShortTime(parsedSession?.scheduled_start_time) || '06:00';
  const endTime = formatShortTime(parsedSession?.scheduled_end_time) || '07:30';
  const timeRange = `${startTime} - ${endTime}`;

  const batchNameStr = parsedSession
    ? `${parsedSession.batch_name} (${timeRange})`
    : undefined;

  const dateTextStr = parsedSession?.session_date
    ? `Today · ${parsedSession.session_date}`
    : undefined;

  return (
    <StartClassOverview
      batchTitle={
        params.title
          ? `${params.title} Students`
          : parsedSession
          ? `${parsedSession.batch_name} Students`
          : undefined
      }
      batchName={batchNameStr}
      dateText={dateTextStr}
      students={mappedStudents.length > 0 ? mappedStudents : undefined}
      sessionId={parsedSession?.id ? String(parsedSession.id) : undefined}
      onBackPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/batches' as any);
        }
      }}
    />
  );
}
