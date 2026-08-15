import React from 'react';
import { router } from 'expo-router';
import { FeeOverview } from '@/features/fees';
import { useFeesPage } from '@/hooks/use-fees';

export default function FeesScreen() {
  const { data: feeData, isLoading, isRefetching, refetch } = useFeesPage();

  const overview = feeData?.overview;

  const mappedStudents = feeData?.students?.map((s) => ({
    id: String(s.id),
    name: s.name,
    location: s.batch_name || s.location || 'Batch',
    phone: s.phone || '',
    paymentStatus: (s.payment_status?.toLowerCase() as any) || 'overdue',
    amount: s.amount ? `₹${s.amount.toLocaleString('en-IN')}` : '₹1,250',
    paidDate: s.paid_date || undefined,
  }));

  const mappedRecentPayments = feeData?.recent_payments?.map((rp) => ({
    id: String(rp.id),
    name: rp.name,
    timeAgoOrDate: rp.time_ago_or_date || 'Today',
    paymentMethod: rp.payment_method || 'UPI',
    amount: rp.amount ? `₹${rp.amount.toLocaleString('en-IN')}` : '₹0',
  }));

  return (
    <FeeOverview
      screenTitle="Fees Overview"
      totalStudentsCount={overview?.total_students_count ? String(overview.total_students_count) : '0'}
      todayCollectionCount={overview?.today_collection_count ? String(overview.today_collection_count) : '0'}
      totalCollectionTarget={overview?.total_collection_target ? String(overview.total_collection_target) : '0'}
      pendingFeesAmount={overview?.pending_fees_amount ? `₹${overview.pending_fees_amount.toLocaleString('en-IN')}` : '₹0'}
      thisMonthAmount={overview?.this_month_amount ? `₹${overview.this_month_amount.toLocaleString('en-IN')}` : '₹0'}
      students={mappedStudents}
      recentPayments={mappedRecentPayments}
      isLoading={isLoading}
      isRefetching={isRefetching}
      onRefresh={refetch}
      onStudentPress={(student) => {
        router.push({
          pathname: '/(tabs)/fees/student-profile',
          params: { id: student.id, studentData: JSON.stringify(student) },
        } as any);
      }}
      onCollectFeePress={(student) => {
        const studentForCollect = {
          id: student.id,
          name: student.name,
          studentId: `ID: SA-2024-${(student.id || '1').toString().padStart(4, '0')}`,
          location: student.location || 'Batch',
          dueAmount: student.amount || '₹1,250',
          dueLabel: 'Due Amount',
        };
        router.push({
          pathname: '/(tabs)/fees/CollectFee' as any,
          params: { studentData: JSON.stringify(studentForCollect) },
        });
      }}
    />
  );
}