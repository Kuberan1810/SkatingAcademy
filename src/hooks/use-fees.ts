import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesApi, FeePageData, CollectFeeRequest, CollectFeeResponseData } from '@/api/fees.api';

export const FEE_QUERY_KEYS = {
  all: ['fees'] as const,
  page: ['fees', 'page'] as const,
};

export function useFeesPage() {
  return useQuery<FeePageData, Error>({
    queryKey: FEE_QUERY_KEYS.page,
    queryFn: async () => {
      return await feesApi.getFeesPage();
    },
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
