import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  feesApi,
  FeePageData,
  CollectFeeRequest,
  CollectFeeResponseData,
  PendingFeesData,
} from '@/api/fees.api';

export const FEE_QUERY_KEYS = {
  all: ['fees'] as const,
  page: ['fees', 'page'] as const,
  pending: (status = 'all', search = '') => ['fees', 'pending', status, search] as const,
};

export function useFeesPage() {
  return useQuery<FeePageData, Error>({
    queryKey: FEE_QUERY_KEYS.page,
    queryFn: async () => {
      return await feesApi.getFeesPage();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function usePendingFees(status: string = 'all', search?: string) {
  return useQuery<PendingFeesData, Error>({
    queryKey: FEE_QUERY_KEYS.pending(status, search || ''),
    queryFn: async () => {
      return await feesApi.getPendingFees(status, search);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCollectFee() {
  const queryClient = useQueryClient();

  return useMutation<CollectFeeResponseData, Error, CollectFeeRequest>({
    mutationFn: async (payload: CollectFeeRequest) => {
      return await feesApi.collectFee(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEE_QUERY_KEYS.all });
    },
  });
}
