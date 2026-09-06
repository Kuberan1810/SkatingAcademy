import { useMutation } from '@tanstack/react-query';
import {
  reportsApi,
  StudentExportParams,
  SingleStudentExportParams,
  FeeOverviewExportParams,
  ExportResult,
} from '@/api/reports.api';

export const REPORT_QUERY_KEYS = {
  all: ['reports'] as const,
  students: (batchId?: number | string) => ['reports', 'students', batchId] as const,
  singleStudent: (studentId?: number | string) => ['reports', 'students', 'single', studentId] as const,
  feesOverview: ['reports', 'fees', 'overview'] as const,
};

/**
 * Hook for exporting student reports (Excel, PDF, CSV) for a batch or all students.
 */
export function useExportStudentReport() {
  return useMutation<ExportResult, Error, StudentExportParams>({
    mutationFn: async (params: StudentExportParams) => {
      return await reportsApi.exportStudentReport(params);
    },
  });
}

/**
 * Hook for exporting a single individual student's report (PDF, Excel, CSV) by student ID.
 */
export function useExportSingleStudentReport() {
  return useMutation<ExportResult, Error, SingleStudentExportParams>({
    mutationFn: async (params: SingleStudentExportParams) => {
      return await reportsApi.exportSingleStudentReport(params);
    },
  });
}

/**
 * Hook for exporting fee overview reports (Excel, PDF, CSV) with comprehensive financial filters.
 */
export function useExportFeeOverviewReport() {
  return useMutation<ExportResult, Error, FeeOverviewExportParams>({
    mutationFn: async (params: FeeOverviewExportParams) => {
      return await reportsApi.exportFeeOverviewReport(params);
    },
  });
}
