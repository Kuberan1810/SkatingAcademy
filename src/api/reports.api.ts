import { API_BASE_URL } from './client';
import { ENDPOINTS } from './endpoints';
import { getToken } from '@/store/auth-store';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { StorageAccessFramework, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export interface StudentExportParams {
  batch_id?: number | string | null;
  month?: number | null;
  year?: number | null;
  status?: string | null;
  fee_status?: string | null;
  format?: 'xlsx' | 'pdf' | 'csv';
  batchName?: string;
  actionType?: 'download' | 'share';
}

export interface SingleStudentExportParams {
  studentId: number | string;
  studentName?: string;
  month?: number | null;
  year?: number | null;
  format?: 'xlsx' | 'pdf' | 'csv';
  actionType?: 'download' | 'share';
}

export interface FeeOverviewExportParams {
  month?: number | null;
  year?: number | null;
  batch_id?: number | string | null;
  fee_status?: string | null;
  payment_method?: string | null;
  format?: 'xlsx' | 'pdf' | 'csv';
  actionType?: 'download' | 'share';
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  message?: string;
}

const MIME_TYPES: Record<string, { mimeType: string; uti: string; ext: string }> = {
  xlsx: {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uti: 'com.microsoft.excel.xlsx',
    ext: 'xlsx',
  },
  pdf: {
    mimeType: 'application/pdf',
    uti: 'com.adobe.pdf',
    ext: 'pdf',
  },
  csv: {
    mimeType: 'text/csv',
    uti: 'public.comma-separated-values-text',
    ext: 'csv',
  },
};

export const reportsApi = {
  /**
   * Export student report for a specific batch (or all students).
   * Downloads the file with authentication headers and provides both direct save and share functionality.
   */
  exportStudentReport: async (params: StudentExportParams): Promise<ExportResult> => {
    const format = params.format || 'xlsx';
    const formatMeta = MIME_TYPES[format] || MIME_TYPES.xlsx;
    const actionType = params.actionType || 'download';

    // Build URL query string
    const queryParts: string[] = [];
    if (params.batch_id !== undefined && params.batch_id !== null) {
      queryParts.push(`batch_id=${encodeURIComponent(String(params.batch_id))}`);
    }
    if (params.month !== undefined && params.month !== null) {
      queryParts.push(`month=${encodeURIComponent(String(params.month))}`);
    }
    if (params.year !== undefined && params.year !== null) {
      queryParts.push(`year=${encodeURIComponent(String(params.year))}`);
    }
    if (params.status && params.status.toLowerCase() !== 'all') {
      queryParts.push(`status=${encodeURIComponent(params.status.toLowerCase())}`);
    }
    if (params.fee_status && params.fee_status.toLowerCase() !== 'all') {
      queryParts.push(`fee_status=${encodeURIComponent(params.fee_status.toLowerCase())}`);
    }
    queryParts.push(`format=${encodeURIComponent(format)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const downloadUrl = `${API_BASE_URL}${ENDPOINTS.reports.studentsExport}${queryString}`;

    const token = await getToken();
    const cleanBatchName = (params.batchName || `Batch_${params.batch_id || 'All'}`)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filterParts = [
      params.fee_status && params.fee_status !== 'all' ? params.fee_status : null,
      params.status && params.status !== 'all' ? params.status : null,
      params.month ? `M${params.month}` : null,
      params.year ? `Y${params.year}` : null,
    ].filter(Boolean).join('_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `Student_Report_${cleanBatchName}${filterParts ? `_${filterParts}` : ''}_${timestamp}.${formatMeta.ext}`;

    if (Platform.OS === 'web') {
      // For web, open link or trigger blob download with authorization
      const response = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      return { success: true, message: 'Report downloaded successfully' };
    }

    // For Android / iOS using modern Expo SDK 57 FileSystem API
    const targetFile = new File(Paths.document, fileName);

    const downloadedFile = await File.downloadFileAsync(downloadUrl, targetFile, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      idempotent: true,
    });

    // If user selected Share
    if (actionType === 'share') {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(downloadedFile.uri, {
          mimeType: formatMeta.mimeType,
          dialogTitle: `Share Student Report (${format.toUpperCase()})`,
          UTI: formatMeta.uti,
        });
      }
      return {
        success: true,
        filePath: downloadedFile.uri,
        message: 'Report shared successfully',
      };
    }

    // If user selected Download on Android
    if (Platform.OS === 'android') {
      try {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64Data = await downloadedFile.base64();
          const createdFileUri = await StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            formatMeta.mimeType
          );
          await writeAsStringAsync(createdFileUri, base64Data, {
            encoding: EncodingType.Base64,
          });
          return {
            success: true,
            filePath: createdFileUri,
            message: 'Report saved to device storage successfully',
          };
        }
      } catch (safError) {
        console.warn('Storage Access Framework error, fallback to share sheet:', safError);
      }
    }

    // Fallback or iOS Save to Files
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(downloadedFile.uri, {
        mimeType: formatMeta.mimeType,
        dialogTitle: `Save Student Report (${format.toUpperCase()})`,
        UTI: formatMeta.uti,
      });
    }

    return {
      success: true,
      filePath: downloadedFile.uri,
      message: 'Report exported successfully',
    };
  },

  /**
   * Export Fee Overview report with filters for month, year, batch_id, fee_status, payment_method, format.
   * Downloads the file with authorization and provides both direct save and share options.
   */
  exportFeeOverviewReport: async (params: FeeOverviewExportParams): Promise<ExportResult> => {
    const format = params.format || 'xlsx';
    const formatMeta = MIME_TYPES[format] || MIME_TYPES.xlsx;
    const actionType = params.actionType || 'download';

    // Build URL query string
    const queryParts: string[] = [];
    if (params.month !== undefined && params.month !== null) {
      queryParts.push(`month=${encodeURIComponent(String(params.month))}`);
    }
    if (params.year !== undefined && params.year !== null) {
      queryParts.push(`year=${encodeURIComponent(String(params.year))}`);
    }
    if (params.batch_id !== undefined && params.batch_id !== null) {
      queryParts.push(`batch_id=${encodeURIComponent(String(params.batch_id))}`);
    }
    if (params.fee_status && params.fee_status.toLowerCase() !== 'all') {
      queryParts.push(`fee_status=${encodeURIComponent(params.fee_status.toLowerCase())}`);
    }
    if (params.payment_method && params.payment_method.toLowerCase() !== 'all') {
      queryParts.push(`payment_method=${encodeURIComponent(params.payment_method.toLowerCase())}`);
    }
    queryParts.push(`format=${encodeURIComponent(format)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const downloadUrl = `${API_BASE_URL}${ENDPOINTS.reports.feesOverviewExport}${queryString}`;

    const token = await getToken();
    const filterParts = [
      params.batch_id ? `Batch_${params.batch_id}` : null,
      params.fee_status && params.fee_status !== 'all' ? params.fee_status : null,
      params.payment_method && params.payment_method !== 'all' ? params.payment_method : null,
      params.month ? `M${params.month}` : null,
      params.year ? `Y${params.year}` : null,
    ].filter(Boolean).join('_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `Fee_Overview_Report${filterParts ? `_${filterParts}` : ''}_${timestamp}.${formatMeta.ext}`;

    if (Platform.OS === 'web') {
      const response = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      return { success: true, message: 'Fee overview report downloaded successfully' };
    }

    const targetFile = new File(Paths.document, fileName);

    const downloadedFile = await File.downloadFileAsync(downloadUrl, targetFile, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      idempotent: true,
    });

    if (actionType === 'share') {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(downloadedFile.uri, {
          mimeType: formatMeta.mimeType,
          dialogTitle: `Share Fee Overview Report (${format.toUpperCase()})`,
          UTI: formatMeta.uti,
        });
      }
      return {
        success: true,
        filePath: downloadedFile.uri,
        message: 'Fee overview report shared successfully',
      };
    }

    if (Platform.OS === 'android') {
      try {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64Data = await downloadedFile.base64();
          const createdFileUri = await StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            formatMeta.mimeType
          );
          await writeAsStringAsync(createdFileUri, base64Data, {
            encoding: EncodingType.Base64,
          });
          return {
            success: true,
            filePath: createdFileUri,
            message: 'Fee overview report saved to device storage successfully',
          };
        }
      } catch (safError) {
        console.warn('Storage Access Framework error, fallback to share sheet:', safError);
      }
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(downloadedFile.uri, {
        mimeType: formatMeta.mimeType,
        dialogTitle: `Save Fee Overview Report (${format.toUpperCase()})`,
        UTI: formatMeta.uti,
      });
    }

    return {
      success: true,
      filePath: downloadedFile.uri,
      message: 'Fee overview report exported successfully',
    };
  },

  /**
   * Export single student report with filters for month, year, and format (PDF, Excel, CSV).
   * Supports direct storage download or system share dialog.
   */
  exportSingleStudentReport: async (params: SingleStudentExportParams): Promise<ExportResult> => {
    const format = params.format || 'pdf';
    const formatMeta = MIME_TYPES[format] || MIME_TYPES.pdf;
    const actionType = params.actionType || 'download';

    // Build URL query string
    const queryParts: string[] = [];
    if (params.month !== undefined && params.month !== null) {
      queryParts.push(`month=${encodeURIComponent(String(params.month))}`);
    }
    if (params.year !== undefined && params.year !== null) {
      queryParts.push(`year=${encodeURIComponent(String(params.year))}`);
    }
    queryParts.push(`format=${encodeURIComponent(format)}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const endpointPath = ENDPOINTS.reports.singleStudentExport(params.studentId);
    const downloadUrl = `${API_BASE_URL}${endpointPath}${queryString}`;

    const token = await getToken();
    const cleanStudentName = (params.studentName || `Student_${params.studentId}`)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filterParts = [
      params.month ? `M${params.month}` : null,
      params.year ? `Y${params.year}` : null,
    ].filter(Boolean).join('_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `${cleanStudentName}_Report${filterParts ? `_${filterParts}` : ''}_${timestamp}.${formatMeta.ext}`;

    if (Platform.OS === 'web') {
      const response = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      return { success: true, message: 'Student report downloaded successfully' };
    }

    const targetFile = new File(Paths.document, fileName);

    const downloadedFile = await File.downloadFileAsync(downloadUrl, targetFile, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      idempotent: true,
    });

    if (actionType === 'share') {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(downloadedFile.uri, {
          mimeType: formatMeta.mimeType,
          dialogTitle: `Share ${params.studentName || 'Student'} Report (${format.toUpperCase()})`,
          UTI: formatMeta.uti,
        });
      }
      return {
        success: true,
        filePath: downloadedFile.uri,
        message: 'Student report shared successfully',
      };
    }

    if (Platform.OS === 'android') {
      try {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64Data = await downloadedFile.base64();
          const createdFileUri = await StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            formatMeta.mimeType
          );
          await writeAsStringAsync(createdFileUri, base64Data, {
            encoding: EncodingType.Base64,
          });
          return {
            success: true,
            filePath: createdFileUri,
            message: 'Student report saved to device storage successfully',
          };
        }
      } catch (safError) {
        console.warn('Storage Access Framework error, fallback to share sheet:', safError);
      }
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(downloadedFile.uri, {
        mimeType: formatMeta.mimeType,
        dialogTitle: `Save ${params.studentName || 'Student'} Report (${format.toUpperCase()})`,
        UTI: formatMeta.uti,
      });
    }

    return {
      success: true,
      filePath: downloadedFile.uri,
      message: 'Student report exported successfully',
    };
  },
};

