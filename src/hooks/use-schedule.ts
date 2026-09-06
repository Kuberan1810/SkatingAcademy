import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/api/schedule.api';
import {
  CreateCompensationRequest,
  CompensationScheduleData,
} from '@/types/schedule';
import { BATCH_QUERY_KEYS } from './use-batches';

export const SCHEDULE_QUERY_KEYS = {
  all: ['schedule'] as const,
  compensation: ['schedule', 'compensation'] as const,
};

/**
 * Mutation for scheduling an extra or compensation class.
 */
export function useCreateCompensationSchedule() {
  const queryClient = useQueryClient();

  return useMutation<
    CompensationScheduleData,
    Error,
    CreateCompensationRequest
  >({
    mutationFn: async (payload: CreateCompensationRequest) => {
      return await scheduleApi.createCompensation(payload);
    },
    onSuccess: () => {
      // Invalidate batches, dashboard overview, and sessions to show new schedule instantly
      queryClient.invalidateQueries({ queryKey: BATCH_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.all });
    },
  });
}
