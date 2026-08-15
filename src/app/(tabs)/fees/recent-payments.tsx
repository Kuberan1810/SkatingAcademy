import React from 'react';
import { RecentPaymentsOverview } from '@/features/fees';
import { useFeesPage } from '@/hooks/use-fees';

export default function RecentPaymentsScreen() {
  const { data: feeData, isLoading, isRefetching, refetch } = useFeesPage();

  const mappedRecentPayments = feeData?.recent_payments?.map((rp) => ({
    id: String(rp.id),
    name: rp.name,
    timeAgoOrDate: rp.time_ago_or_date || 'Today',
    paymentMethod: rp.payment_method || 'UPI',
    amount: rp.amount ? `₹${rp.amount.toLocaleString('en-IN')}` : '₹0',
    avatar: (rp as any).avatar || (rp as any).avatar_uri || undefined,
  }));

  return (
    <RecentPaymentsOverview
      screenTitle="Recent Payments"
      payments={mappedRecentPayments}
      isLoading={isLoading}
      isRefetching={isRefetching}
      onRefresh={refetch}
    />
  );
}
