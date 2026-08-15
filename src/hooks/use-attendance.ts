import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  attendanceApi,
  ConfirmAttendanceRequest,
  ConfirmAttendanceResponseData,
} from '@/api/attendance.api';
import { BATCH_QUERY_KEYS } from './use-batches';

export function useConfirmAttendance() {
  const queryClient = useQueryClient();

  return useMutation<
    ConfirmAttendanceResponseData,
    Error,
    ConfirmAttendanceRequest
  >({
    mutationFn: async (payload: ConfirmAttendanceRequest) => {
      return await attendanceApi.confirmAttendance(payload);
    },
    onSuccess: () => {
      // Invalidate queries to refresh batch, sessions, and dashboard counts
      queryClient.invalidateQueries({ queryKey: BATCH_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
