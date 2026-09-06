import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import CompletedClassOverview from '@/features/batches/CompletedClass/CompletedClassOverview';
import { useCompletedSession } from '@/hooks/use-sessions';

export default function DashboardCompletedClassScreen() {
  const params = useLocalSearchParams<any>();
  const sessionId = params.sessionId || params.id || '1';

  const { data: completedData, isLoading } = useCompletedSession(sessionId);

  const mappedStudents = completedData?.students?.map((s) => ({
    id: String(s.id),
    name: s.name,
    attendancePercent: s.attendance_percent || '0% Attendance',
    status: (s.status?.toLowerCase() as any) || 'absent',
    attendanceRatio: `${s.attended_count}/${s.conducted_count}`,
    avatar: s.avatar_uri || undefined,
  }));

  const details = completedData?.session_details;

  const isCompensation =
    Boolean(details?.is_compensation_class) ||
    Boolean((completedData as any)?.is_compensation_class) ||
    params.isCompensation === 'true' ||
    params.isCompensation === '1' ||
    Boolean(params.compensationReason);

  const compReason =
    details?.compensation_reason ||
    (completedData as any)?.compensation_reason ||
    params.compensationReason ||
    null;

  return (
    <CompletedClassOverview
      batchTitle={details?.batch_title || (params.title ? `${params.title} Students` : undefined)}
      batchName={details?.batch_name || params.batchName}
      dateText={details?.date_text || params.dateText}
      totalCount={details?.total_count}
      presentCount={details?.present_count}
      absentCount={details?.absent_count}
      students={mappedStudents}
      isLoading={isLoading}
      isCompensationClass={isCompensation}
      compensationReason={compReason}
      onBackPress={() => {
        if (params.from === 'upcoming-sessions') {
          router.replace('/(tabs)/dashboard/upcoming-sessions' as any);
        } else if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/dashboard' as any);
        }
      }}
    />
  );
}
