import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface FeePageOverview {
  total_students_count: number;
  today_collection_count: number;
  total_collection_target: number;
  pending_fees_amount: number;
  this_month_amount: number;
}

export interface FeePageStudentItem {
  id: string;
  name: string;
  batch_name?: string;
  location?: string;
  phone?: string;
  payment_status: string;
  amount: number;
  paid_date?: string | null;
}

export interface RecentPaymentItemData {
  id: string;
  name: string;
  time_ago_or_date: string;
  payment_method: string;
  amount: number;
}

export interface FeePageData {
  overview: FeePageOverview;
  students: FeePageStudentItem[];
  recent_payments: RecentPaymentItemData[];
}

export interface FeePageResponse {
  status: string;
  message: string;
  data: FeePageData;
}

export interface CollectFeeRequest {
  student_id: number | string;
  base_amount: number;
  discount?: number;
  late_fine?: number;
  net_payable: number;
  payment_method: string;
  notes?: string;
  fee_month?: number;
  fee_year?: number;
  fee_period_label?: string;
}

export interface CollectFeeResponseData {
  transaction_id: string;
  student_id: number;
  student_name: string;
  batch_name?: string;
  fee_month?: number;
  fee_year?: number;
  fee_period_label?: string;
  base_amount: number;
  discount: number;
  late_fine: number;
  net_payable: number;
  payment_method: string;
  notes?: string;
  collected_by?: number;
  payment_date?: string;
  created_at?: string;
}

export interface CollectFeeResponse {
  status: string;
  message: string;
  data: CollectFeeResponseData;
}

export const feesApi = {
  getFeesPage: async (): Promise<FeePageData> => {
    const response = await apiClient.get<FeePageResponse>(ENDPOINTS.fees.page);
    return response.data.data;
  },

  collectFee: async (payload: CollectFeeRequest): Promise<CollectFeeResponseData> => {
    const response = await apiClient.post<CollectFeeResponse>(ENDPOINTS.fees.collect, payload);
    return response.data.data;
  },
};
