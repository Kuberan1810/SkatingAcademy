import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { ApiStudentProfileData, CreateStudentRequest, Student, StudentsPageData } from '@/types/student';
import { ApiResponse } from '@/types/api';

export const studentsApi = {
  /**
   * POST /api/v1/students
   * Create a new student.
   */
  createStudent: async (payload: CreateStudentRequest): Promise<Student> => {
    const response = await apiClient.post<ApiResponse<Student> | Student>(
      ENDPOINTS.students.create,
      payload
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as Student;
  },

  /**
   * GET /api/v1/students/page
   * Fetch overview stats & students list.
   */
  getStudentsPage: async (): Promise<StudentsPageData> => {
    const response = await apiClient.get<ApiResponse<StudentsPageData> | StudentsPageData>(
      ENDPOINTS.students.page
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as StudentsPageData;
  },

  /**
   * GET /api/v1/students
   * List all students.
   */
  getStudents: async (): Promise<Student[]> => {
    const response = await apiClient.get<ApiResponse<Student[]> | Student[]>(
      ENDPOINTS.students.list
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as Student[];
  },

  /**
   * GET /api/v1/students/:id
   * Get student detail by ID.
   */
  getStudentById: async (id: number | string): Promise<Student> => {
    const response = await apiClient.get<ApiResponse<Student> | Student>(
      ENDPOINTS.students.detail(id)
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as Student;
  },

  /**
   * GET /api/v1/students/:id/profile
   * Fetch complete student profile data including attendance grid & fees.
   */
  getStudentProfile: async (id: number | string): Promise<ApiStudentProfileData> => {
    const response = await apiClient.get<ApiResponse<ApiStudentProfileData> | ApiStudentProfileData>(
      ENDPOINTS.students.profile(id)
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as ApiStudentProfileData;
  },

  /**
   * PUT /api/v1/students/:id
   * Update student by ID.
   */
  updateStudent: async (
    id: number | string,
    payload: Partial<CreateStudentRequest>
  ): Promise<Student> => {
    const response = await apiClient.put<ApiResponse<Student> | Student>(
      ENDPOINTS.students.update(id),
      payload
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData as Student;
  },

  /**
   * DELETE /api/v1/students/:id
   * Delete student by ID.
   */
  deleteStudent: async (id: number | string): Promise<any> => {
    const response = await apiClient.delete(ENDPOINTS.students.delete(id));
    return response.data;
  },

  /**
   * POST /api/v1/students/bulk-delete
   * Delete multiple students by IDs.
   */
  bulkDeleteStudents: async (studentIds: (number | string)[]): Promise<any> => {
    const response = await apiClient.post(ENDPOINTS.students.bulkDelete, {
      student_ids: studentIds.map((id) => Number(id)),
    });
    return response.data;
  },

  /**
   * POST /api/v1/students/import/preview
   * Upload file (XLSX, CSV, DOCX, TXT) and preview parsed student data.
   */
  previewStudentImport: async (file: {
    uri: string;
    name: string;
    type?: string;
  }): Promise<any> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream',
    } as any);

    const response = await apiClient.post(
      ENDPOINTS.students.importPreview,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData;
  },

  /**
   * POST /api/v1/students/import/text/preview
   * Submit raw text for OCR / text parsing preview.
   */
  previewStudentImportText: async (text: string): Promise<any> => {
    const response = await apiClient.post(
      ENDPOINTS.students.importTextPreview,
      text,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData;
  },

  /**
   * POST /api/v1/students/import/confirm
   * Confirm student bulk import with batch_id and previewed students.
   */
  confirmStudentImport: async (payload: { batch_id: number; students: any[] }): Promise<any> => {
    const response = await apiClient.post(
      ENDPOINTS.students.importConfirm,
      payload
    );

    const resData = response.data as any;
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData;
  },
};
