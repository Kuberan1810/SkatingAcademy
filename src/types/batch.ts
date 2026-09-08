export interface CreateBatchRequest {
  batch_name: string;
  level: string;
  location: string;
  description?: string;
  class_type: string;
  training_days: string[];
  start_time: string;
  end_time: string;
  monthly_fee: number;
  yearly_fee?: number;
}

export interface Batch {
  id: number;
  batch_name: string;
  level: string;
  location: string;
  description?: string | null;
  class_type: string;
  training_days: string[];
  start_time: string;
  end_time: string;
  monthly_fee: number;
  yearly_fee?: number;
  is_active?: boolean;
  students_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BatchFilterParams {
  search?: string;
  level?: string;
  class_type?: string;
}

export interface BatchesOverviewData {
  total_batches: number;
  new_batches_this_month: number;
  todays_sessions: {
    scheduled: number;
    completed: number;
    total_active_sessions: number;
  };
  students: {
    total: number;
    new_this_month?: number;
  };
  todays_attendance: {
    present: number;
    total_expected: number;
    percentage: number;
  };
}

export interface ApiBatchItem {
  id: string;
  title: string;
  date: string;
  time: string;
  students_count: number;
  status: string; // 'upcoming' | 'completed' | 'live'
  category: string;
  attendance?: string | null;
  session_id?: string | number | null;
  sessionId?: string | number | null;
}

export interface BatchesPageData {
  overview: BatchesOverviewData;
  batches: ApiBatchItem[];
}

export interface BatchStudentItem {
  id: string | number;
  name: string;
  joined_date: string;
  location: string;
  attendance_percent: string;
  phone: string;
  payment_status: string;
  amount: number;
  paid_date: string | null;
  last_payment?: any;
  attendance_ratio?: string;
  attendance_ratio_status?: string;
  avatar_uri: string | null;
}

export interface BatchStudentsData {
  batch_details: {
    batch_title?: string;
    batch_name?: string;
    total_students?: string | number;
    avg_attendance?: string;
  };
  students: BatchStudentItem[];
}

