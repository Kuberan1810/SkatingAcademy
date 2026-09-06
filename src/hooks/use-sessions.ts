import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  sessionsApi,
  StartSessionRequest,
  SessionData,
  CompletedSessionData,
} from '@/api/sessions.api';
import { BATCH_QUERY_KEYS } from './use-batches';

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation<SessionData, Error, StartSessionRequest>({
    mutationFn: async (payload: StartSessionRequest) => {
      return await sessionsApi.startSession(payload);
    },
    onSuccess: () => {
      // Invalidate batches and session queries to update live statuses instantly
      queryClient.invalidateQueries({ queryKey: BATCH_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCompletedSession(sessionId: number | string, enabled = true) {
  return useQuery<CompletedSessionData, Error>({
    queryKey: ['sessions', 'completed', String(sessionId)],
    queryFn: async () => {
      return await sessionsApi.getCompletedSession(sessionId);
    },
    enabled: enabled && !!sessionId && String(sessionId) !== 'undefined',
  });
}

export function useSessionDetail(sessionId: number | string, enabled = true) {
  return useQuery<SessionData, Error>({
    queryKey: ['sessions', 'detail', String(sessionId)],
    queryFn: async () => {
      return await sessionsApi.getSessionDetail(sessionId);
    },
    enabled: enabled && !!sessionId && String(sessionId) !== 'undefined',
  });
}
