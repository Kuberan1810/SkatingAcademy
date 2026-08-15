import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/api/students.api';
import { ApiStudentProfileData, CreateStudentRequest, Student, StudentsPageData } from '@/types/student';
import { getErrorMessage } from '@/utils/error';

export const STUDENT_QUERY_KEYS = {
  all: ['students'] as const,
  list: ['students', 'list'] as const,
  page: ['students', 'page'] as const,
  detail: (id: number | string) => ['students', 'detail', id] as const,
  profile: (id: number | string) => ['students', 'profile', id] as const,
};

/**
 * TanStack Query mutation for creating a student.
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation<Student, Error, CreateStudentRequest>({
    mutationFn: async (payload: CreateStudentRequest) => {
      return await studentsApi.createStudent(payload);
    },
    onSuccess: () => {
      // Invalidate student and batch queries to refresh stats and student lists instantly
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

/**
 * TanStack Query mutation for updating an existing student.
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation<
    Student,
    Error,
    { id: number | string; payload: Partial<CreateStudentRequest> }
  >({
    mutationFn: async ({ id, payload }) => {
      return await studentsApi.updateStudent(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

/**
 * TanStack Query mutation for deleting a student.
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, number | string>({
    mutationFn: async (id: number | string) => {
      return await studentsApi.deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

/**
 * TanStack Query hook for fetching the main Students page data.
 */
export function useStudentsPage(enabled = true) {
  return useQuery<StudentsPageData, Error>({
    queryKey: STUDENT_QUERY_KEYS.page,
    queryFn: async () => {
      return await studentsApi.getStudentsPage();
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
}

/**
 * TanStack Query hook for fetching student details by ID.
 */
export function useStudentDetail(id: number | string, enabled = true) {
  return useQuery<Student, Error>({
    queryKey: STUDENT_QUERY_KEYS.detail(id),
    queryFn: async () => {
      return await studentsApi.getStudentById(id);
    },
    enabled: enabled && !!id,
  });
}

/**
 * TanStack Query hook for fetching full student profile data.
 */
export function useStudentProfile(id: number | string, enabled = true) {
  return useQuery<ApiStudentProfileData, Error>({
    queryKey: STUDENT_QUERY_KEYS.profile(id),
    queryFn: async () => {
      return await studentsApi.getStudentProfile(id);
    },
    enabled: enabled && !!id,
  });
}

/**
 * Unified students hook.
 */
export function useStudents() {
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const pageQuery = useStudentsPage();

  return {
    pageData: pageQuery.data,
    isPageLoading: pageQuery.isLoading,
    isPageError: pageQuery.isError,
    pageError: pageQuery.error ? getErrorMessage(pageQuery.error) : null,
    refetchPage: pageQuery.refetch,

    createStudent: createMutation.mutate,
    createStudentAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? getErrorMessage(createMutation.error) : null,
    resetCreate: createMutation.reset,

    updateStudent: updateMutation.mutate,
    updateStudentAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? getErrorMessage(updateMutation.error) : null,
    resetUpdate: updateMutation.reset,

    deleteStudent: deleteMutation.mutate,
    deleteStudentAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error ? getErrorMessage(deleteMutation.error) : null,
    resetDelete: deleteMutation.reset,
  };
}

export default useStudents;
