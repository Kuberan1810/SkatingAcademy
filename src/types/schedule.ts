export interface CreateCompensationRequest {
  batch_id: number;
  compensation_date: string; // "YYYY-MM-DD"
  original_date?: string | null; // "YYYY-MM-DD" (optional)
  reason?: string | null; // (optional)
}

export interface CompensationScheduleData {
  id: number;
  batch_id: number;
  batch_name: string;
  original_date?: string | null;
  compensation_date: string;
  reason?: string | null;
  status: string;
}

export interface CompensationScheduleResponse {
  status: string;
  message: string;
  data: CompensationScheduleData;
}
