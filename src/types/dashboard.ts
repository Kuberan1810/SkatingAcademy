export interface DashboardOverviewData {
  students: {
    total: number;
    new_this_month: number;
  };
  attendance: {
    present_today: number;
    total_expected: number;
    percentage: number;
  };
  fees: {
    pending_amount: number;
    students_due: number;
  };
  revenue: {
    total: number;
    change_percentage: number;
  };
  total_batches: number;
  new_batches_this_month: number;
  todays_sessions: {
    scheduled: number;
    completed: number;
    total_active_sessions: number;
  };
}

export interface DashboardUpcomingSession {
  id: string;
  batch_id?: number;
  batch_name?: string;
  class_type?: string;
  location?: string;
  date?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  time: string;
  students_count: number | string;
  status?: string;
  time_of_day?: string;
}

export interface DashboardPendingFeeItem {
  id: string;
  student_name: string;
  batch_name: string;
  due_date: string;
  amount: number;
  status: string;
  phone: string;
  avatar_uri?: string | null;
}

export interface DashboardData {
  overview: DashboardOverviewData;
  upcoming_sessions: {
    display_date: string;
    sessions: DashboardUpcomingSession[];
  };
  pending_fees: {
    summary: {
      total_amount: number;
      students_count: number;
    };
    fees: DashboardPendingFeeItem[];
  };
}
