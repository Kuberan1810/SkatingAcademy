import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface AttendanceRecordItem {
  student_id: number;
  status: 'Present' | 'Absent';
}

export interface ConfirmAttendanceRequest {
  session_id: number;
  attendance: AttendanceRecordItem[];
}

export interface ConfirmAttendanceResponseData {
  session_id: number;
  batch_id: number;
  batch_name: string;
  location: string;
  total_students: number;
  present_students: number;
  absent_students: number;
  attendance_confirmed: boolean;
  class_completed: boolean;
  actual_end_time?: string | null;
}

export interface ConfirmAttendanceResponse {
  status: string;
  message: string;
  data: ConfirmAttendanceResponseData;
}

export const attendanceApi = {
  confirmAttendance: async (
    payload: ConfirmAttendanceRequest
  ): Promise<ConfirmAttendanceResponseData> => {
    const response = await apiClient.post<ConfirmAttendanceResponse>(
      ENDPOINTS.attendance.confirm,
      payload
    );
    return response.data.data;
  },
};
