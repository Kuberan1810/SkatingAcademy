export interface CreateStudentRequest {
  full_name: string;
  dob: string; // "YYYY-MM-DD"
  gender: string;
  blood_group?: string | null;
  batch_id: number;
  join_date: string; // "YYYY-MM-DD"
  parent_name: string;
  phone_number: string;
  emergency_contact: string;
  monthly_fee: number;
  avatar_uri?: string | null;
  age?: number;
}

export interface Student {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  dob: string;
  blood_group: string | null;

  batch_id: number;
  batch_name: string;

  join_date: string;

  parent_name: string;
  phone_number: string;
  emergency_contact: string;

  monthly_fee: number;

  avatar_uri: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface StudentsPageData {
  overview: {
    total_students: number;
    new_this_month: number;

    boys_count: number;
    boys_percent: number;

    girls_count: number;
    girls_percent: number;

    pending_fees_count: number;
  };

  students: Array<{
    id: string | number;
    name: string;
    batch_name?: string;
    joined_date: string;
    location: string;
    attendance_percent: string;
    phone: string;
    payment_status: string;
    amount: number;
    paid_date: string | null;

    attendance_ratio?: string;
    attendance_ratio_status?: string;

    attended_count?: number;
    conducted_count?: number;

    avatar_uri: string | null;

    last_payment?: {
      amount: number;
      fee_month: number;
      fee_year: number;
      paid_date: string | null;
    } | null;
  }>;
}

export interface ApiStudentProfileData {
  id: string | number;
  name: string;
  avatar_uri?: string | null;
  joined_date?: string;
  location?: string;
  attendance_percent?: string;
  parent_info?: {
    parent_name?: string;
    phone?: string;
    emergency?: string;
  };
  personal_info?: {
    gender?: string;
    dob?: string;
    blood_group?: string;
  };
  fee_info?: {
    monthly_fee?: number;
    pending?: number;
    status?: string;
  };
  attendance_stats?: {
    present?: number;
    absent?: number;
    attendance_percent?: string;
    scheduled_days_count?: number;
    conducted_days_count?: number;
  };
  attendance_grid?: Array<{
    day_name?: string;
    day_number?: string;
    full_date?: string;
    status?: string;
  }>;
  balance_summary?: {
    last_paid_amount?: number | null;
    last_paid_date?: string | null;
    next_payment_amount?: number;
    next_payment_due_date?: string;
    days_left_text?: string;
  };
  current_month_fee?: {
    month_year?: string;
    amount?: number;
    status?: string;
    status_subtext?: string;
    payment_details?: string;
  };
  transactions?: Array<{
    id?: string;
    title?: string;
    date_and_method?: string;
    amount?: number;
    status?: string;
  }>;
}