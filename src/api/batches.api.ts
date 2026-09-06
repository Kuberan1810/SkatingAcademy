import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { CreateBatchRequest, Batch, BatchesPageData, BatchStudentsData } from '@/types/batch';
import { ApiResponse } from '@/types/api';

export const batchesApi = {
  /**
   * POST /api/v1/batches
   * Create a new training batch.
   */
  createBatch: async (payload: CreateBatchRequest): Promise<Batch> => {
    const response = await apiClient.post<ApiResponse<Batch> | Batch>(
      ENDPOINTS.batches.create,
      payload
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as Batch;
  },

  /**
   * PUT /api/v1/batches/:id
   * Update an existing training batch.
   */
  updateBatch: async (
    id: number | string,
    payload: CreateBatchRequest
  ): Promise<Batch> => {
    const response = await apiClient.put<ApiResponse<Batch> | Batch>(
      ENDPOINTS.batches.update(id),
      payload
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as Batch;
  },

  /**
   * DELETE /api/v1/batches/:id
   * Delete a batch by ID.
   */
  deleteBatch: async (id: number | string): Promise<any> => {
    const response = await apiClient.delete(ENDPOINTS.batches.delete(id));
    return response.data;
  },

  /**
   * GET /api/v1/batches-page
   * Fetch overview stats and batch list for the Batches main screen.
   */
  getBatchesPage: async (): Promise<BatchesPageData> => {
    const response = await apiClient.get<ApiResponse<BatchesPageData> | BatchesPageData>(
      ENDPOINTS.batches.page
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as BatchesPageData;
  },

  /**
   * GET /api/v1/batches
   * List all batches.
   */
  getBatches: async (): Promise<Batch[]> => {
    const response = await apiClient.get<ApiResponse<Batch[]> | Batch[]>(
      ENDPOINTS.batches.list
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as Batch[];
  },

  /**
   * GET /api/v1/batches/:id
   * Get batch details by ID.
   */
  getBatchById: async (id: number | string): Promise<Batch> => {
    const response = await apiClient.get<ApiResponse<Batch> | Batch>(
      ENDPOINTS.batches.detail(id)
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as Batch;
  },

  /**
   * GET /api/v1/batches/:batch_id/students
   * Get list of students belonging to a specific batch.
   */
  getBatchStudents: async (batchId: number | string): Promise<BatchStudentsData> => {
    const response = await apiClient.get<ApiResponse<BatchStudentsData> | BatchStudentsData>(
      ENDPOINTS.batches.students(batchId)
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as BatchStudentsData;
  },
};

