import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import {
  CreateCompensationRequest,
  CompensationScheduleData,
  CompensationScheduleResponse,
} from '@/types/schedule';

export const scheduleApi = {
  createCompensation: async (
    payload: CreateCompensationRequest
  ): Promise<CompensationScheduleData> => {
    const response = await apiClient.post<CompensationScheduleResponse>(
      ENDPOINTS.schedule.compensation,
      payload
    );
    return response.data.data;
  },
};
