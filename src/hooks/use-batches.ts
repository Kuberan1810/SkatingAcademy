import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { batchesApi } from '@/api/batches.api';
import { CreateBatchRequest, Batch, BatchesPageData } from '@/types/batch';
import { getErrorMessage } from '@/utils/error';

export const BATCH_QUERY_KEYS = {
  all: ['batches'] as const,
  list: ['batches', 'list'] as const,
  page: ['batches', 'page'] as const,
  detail: (id: number | string) => ['batches', 'detail', String(id)] as const,
  students: (id: number | string) => ['batches', 'students', String(id)] as const,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    placeholderData: (previousData) => previousData,
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
    gcTime: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * TanStack Query hook for fetching a single batch detail by ID.
 */
export function useBatchDetail(id: number | string, enabled = true) {
  const normId = String(id);
  return useQuery<Batch, Error>({
    queryKey: BATCH_QUERY_KEYS.detail(normId),
    queryFn: async () => {
      return await batchesApi.getBatchById(normId);
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * TanStack Query hook for fetching batch students list with zero-delay caching & placeholder seeding.
 */
export function useBatchStudents(batchId?: number | string, enabled = true) {
  const queryClient = useQueryClient();
  const normalizedId = batchId ? String(batchId) : '';

  return useQuery<import('@/types/batch').BatchStudentsData, Error>({
    queryKey: BATCH_QUERY_KEYS.students(normalizedId),
    queryFn: async () => {
      if (!normalizedId) throw new Error('Batch ID is required');
      return await batchesApi.getBatchStudents(normalizedId);
    },
    enabled: enabled && !!normalizedId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15,   // 15 minutes
    placeholderData: (previousData) => {
      if (previousData) return previousData;
      // Pre-seed batch details from Batches Page cache if available for instantaneous header & stat cards render
      const pageData = queryClient.getQueryData<BatchesPageData>(BATCH_QUERY_KEYS.page);
      const batchItem = pageData?.batches?.find((b: any) => String(b.id) === normalizedId);
      if (batchItem) {
        return {
          batch_details: {
            id: Number(batchItem.id),
            batch_name: (batchItem as any).batch_name || batchItem.title || '',
            batch_title: batchItem.title || (batchItem as any).batch_name || '',
            total_students: batchItem.students_count ? `${batchItem.students_count} Students` : '0 Students',
            avg_attendance: batchItem.attendance || '0%',
            timing: batchItem.time || '',
            category: batchItem.category || '',
          },
          students: [],
        };
      }
      return undefined;
    },
  });
}

/**
 * Utility helper to prefetch batch students in the background for zero-delay instant screen opening.
 */
export function prefetchBatchStudents(queryClient: any, batchId: number | string) {
  if (!batchId) return;
  const idStr = String(batchId);
  queryClient.prefetchQuery({
    queryKey: BATCH_QUERY_KEYS.students(idStr),
    queryFn: () => batchesApi.getBatchStudents(idStr),
    staleTime: 1000 * 60 * 5,
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
