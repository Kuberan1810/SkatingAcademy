import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface StartSessionRequest {
  batch_id: number;
}

export interface SessionStudentItem {
  id: number;
  full_name: string;
  avatar_uri?: string | null;
  batch_name?: string;
  attendance_status?: string;
  attended_classes?: number;
  conducted_classes?: number;
  attendance_percentage?: number;
}

export interface SessionData {
  id: number;
  batch_id: number;
  batch_name: string;
  coach_id: number;
  session_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_start_time: string;
  actual_end_time?: string | null;
  status: string;
  location: string;
  students: SessionStudentItem[];
  created_at?: string;
  updated_at?: string;
}

export interface StartSessionResponse {
  status: string;
  message: string;
  data: SessionData;
}

export interface CompletedSessionStudentItem {
  id: string;
  name: string;
  attendance_percent: string;
  status: 'present' | 'absent';
  attended_count: number;
  conducted_count: number;
  avatar_uri?: string | null;
}

export interface CompletedSessionDetails {
  batch_title: string;
  batch_name: string;
  date_text: string;
  total_count: number;
  present_count: number;
  absent_count: number;
}

export interface CompletedSessionData {
  session_details: CompletedSessionDetails;
  students: CompletedSessionStudentItem[];
}

export interface CompletedSessionResponse {
  status: string;
  message: string;
  data: CompletedSessionData;
}

export const sessionsApi = {
  startSession: async (payload: StartSessionRequest): Promise<SessionData> => {
    const response = await apiClient.post<StartSessionResponse>(
      ENDPOINTS.sessions.start,
      payload
    );
    return response.data.data;
  },

  getCompletedSession: async (
    sessionId: number | string
  ): Promise<CompletedSessionData> => {
    const response = await apiClient.get<CompletedSessionResponse>(
      ENDPOINTS.sessions.completed(sessionId)
    );
    return response.data.data;
  },
};
