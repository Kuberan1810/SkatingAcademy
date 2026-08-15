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
  yearly_fee: number;
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
  yearly_fee: number;
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
}

export interface BatchesPageData {
  overview: BatchesOverviewData;
  batches: ApiBatchItem[];
}
