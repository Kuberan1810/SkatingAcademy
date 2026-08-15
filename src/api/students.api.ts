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
};
