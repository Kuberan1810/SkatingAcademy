import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import StartClassOverview from '@/features/batches/startCLass/StartClassOverview';
import { SessionData } from '@/api/sessions.api';
import { StudentData } from '@/features/batches/startCLass/StudentAttendanceCard';
import { useStartSession } from '@/hooks/use-sessions';

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
  const startSessionMutation = useStartSession();

  let initialParsedSession: SessionData | null = null;
  if (params.sessionData) {
    try {
      initialParsedSession = typeof params.sessionData === 'string'
        ? JSON.parse(params.sessionData)
        : params.sessionData;
    } catch (e) {
      // Suppress parse error
    }
  }

  const [activeSession, setActiveSession] = useState<SessionData | null>(initialParsedSession);

  // If no sessionData is passed, trigger startSession API call using batchId
  useEffect(() => {
    if (!initialParsedSession) {
      const bId = Number(params.batchId);
      if (!isNaN(bId) && bId > 0) {
        startSessionMutation.mutate(
          { batch_id: bId },
          {
            onSuccess: (data) => {
              setActiveSession(data);
            },
          }
        );
      }
    }
  }, [params.batchId, params.sessionData]);

  if (startSessionMutation.isPending && !activeSession) {
    return (
      <View className="flex-1 items-center justify-center bg-white gap-3">
        <ActivityIndicator size="large" color="#4186F7" />
        <Text className="text-[14px] font-urbanist-medium text-secondary">
          Loading class session details...
        </Text>
      </View>
    );
  }

  const currentSession = activeSession || initialParsedSession;

  const mappedStudents: StudentData[] = (currentSession?.students || []).map((s) => ({
    id: String(s.id),
    name: s.full_name,
    batchName: s.batch_name || currentSession?.batch_name || 'Batch',
    avatar: s.avatar_uri || undefined,
    attendanceStatus: (s.attendance_status as any) || undefined,
    attendedClasses: s.attended_classes ?? 0,
    conductedClasses: s.conducted_classes ?? 0,
  }));

  const startTime = formatShortTime(currentSession?.scheduled_start_time) || '06:00';
  const endTime = formatShortTime(currentSession?.scheduled_end_time) || '07:30';
  const timeRange = `${startTime} - ${endTime}`;

  const batchNameStr = currentSession
    ? `${currentSession.batch_name} (${timeRange})`
    : params.title || undefined;

  const dateTextStr = currentSession?.session_date
    ? `Today · ${currentSession.session_date}`
    : 'Today';

  const activeSessionId = currentSession?.id
    ? String(currentSession.id)
    : params.sessionId
    ? String(params.sessionId)
    : undefined;

  const isCompensation =
    Boolean(currentSession?.is_compensation_class) ||
    params.isCompensation === 'true' ||
    params.isCompensation === '1' ||
    Boolean(params.compensationReason);

  const compReason =
    currentSession?.compensation_reason ||
    params.compensationReason ||
    null;

  return (
    <StartClassOverview
      batchTitle={
        params.title
          ? `${params.title} Students`
          : currentSession
          ? `${currentSession.batch_name} Students`
          : undefined
      }
      batchName={batchNameStr}
      dateText={dateTextStr}
      students={mappedStudents.length > 0 ? mappedStudents : undefined}
      sessionId={activeSessionId}
      isCompensationClass={isCompensation}
      compensationReason={compReason}
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
