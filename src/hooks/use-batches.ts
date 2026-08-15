import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { batchesApi } from '@/api/batches.api';
import { CreateBatchRequest, Batch, BatchesPageData } from '@/types/batch';
import { getErrorMessage } from '@/utils/error';

export const BATCH_QUERY_KEYS = {
  all: ['batches'] as const,
  list: ['batches', 'list'] as const,
  page: ['batches', 'page'] as const,
  detail: (id: number | string) => ['batches', 'detail', id] as const,
};

/**
 * TanStack Query mutation for creating a new batch.
 */
export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation<Batch, Error, CreateBatchRequest>({
    mutationFn: async (payload: CreateBatchRequest) => {
      return await batchesApi.createBatch(payload);
    },
    onSuccess: () => {
      // Invalidate batches queries to refresh all batch lists & page overview instantly
      queryClient.invalidateQueries({ queryKey: BATCH_QUERY_KEYS.all });
    },
  });
}

/**
 * TanStack Query mutation for updating an existing batch.
 */
export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation<
    Batch,
    Error,
    { id: number | string; payload: CreateBatchRequest }
  >({
    mutationFn: async ({ id, payload }) => {
      return await batchesApi.updateBatch(id, payload);
    },
    onSuccess: () => {
      // Invalidate batches queries to refresh all batch lists & page overview instantly
      queryClient.invalidateQueries({ queryKey: BATCH_QUERY_KEYS.all });
    },
  });
}

/**
 * TanStack Query mutation for deleting a batch.
 */
export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number | string>({
    mutationFn: async (id: number | string) => {
      return await batchesApi.deleteBatch(id);
    },
    onSuccess: () => {
      // Invalidate batches queries to refresh all batch lists & page overview instantly
      queryClient.invalidateQueries({ queryKey: BATCH_QUERY_KEYS.all });
    },
  });
}

/**
 * TanStack Query hook for fetching the main Batches page overview and list.
 */
export function useBatchesPage(enabled = true) {
  return useQuery<BatchesPageData, Error>({
    queryKey: BATCH_QUERY_KEYS.page,
    queryFn: async () => {
      return await batchesApi.getBatchesPage();
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * TanStack Query hook for fetching list of batches.
 */
export function useBatchesList(enabled = true) {
  return useQuery<Batch[], Error>({
    queryKey: BATCH_QUERY_KEYS.list,
    queryFn: async () => {
      return await batchesApi.getBatches();
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * TanStack Query hook for fetching a single batch detail by ID.
 */
export function useBatchDetail(id: number | string, enabled = true) {
  return useQuery<Batch, Error>({
    queryKey: BATCH_QUERY_KEYS.detail(id),
    queryFn: async () => {
      return await batchesApi.getBatchById(id);
    },
    enabled: enabled && !!id,
  });
}

/**
 * Unified batches hook.
 */
export function useBatches() {
  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();
  const deleteMutation = useDeleteBatch();
  const pageQuery = useBatchesPage();
  const batchesQuery = useBatchesList();

  return {
    pageData: pageQuery.data,
    isPageLoading: pageQuery.isLoading,
    isPageError: pageQuery.isError,
    pageError: pageQuery.error ? getErrorMessage(pageQuery.error) : null,
    refetchPage: pageQuery.refetch,

    batches: batchesQuery.data ?? [],
    isLoading: batchesQuery.isLoading,
    isError: batchesQuery.isError,
    error: batchesQuery.error ? getErrorMessage(batchesQuery.error) : null,
    refetch: batchesQuery.refetch,

    createBatch: createMutation.mutate,
    createBatchAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? getErrorMessage(createMutation.error) : null,
    resetCreate: createMutation.reset,

    updateBatch: updateMutation.mutate,
    updateBatchAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? getErrorMessage(updateMutation.error) : null,
    resetUpdate: updateMutation.reset,

    deleteBatch: deleteMutation.mutate,
    deleteBatchAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error ? getErrorMessage(deleteMutation.error) : null,
    resetDelete: deleteMutation.reset,
  };
}

export default useBatches;
