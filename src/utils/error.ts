import axios, { AxiosError } from 'axios';
import { ApiValidationError } from '@/types/auth';

/**
 * Extracts a human-readable error message from any backend API or network error.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiValidationError | undefined;

    if (data) {
      if (typeof data.detail === 'string') {
        return data.detail;
      }

      if (Array.isArray(data.detail) && data.detail.length > 0) {
        const first = data.detail[0];
        if (first?.msg) {
          const field = first.loc && first.loc.length > 0 ? first.loc[first.loc.length - 1] : '';
          return field ? `${field}: ${first.msg}` : first.msg;
        }
      }

      if (data.message) {
        return data.message;
      }
    }

    if (error.response?.status === 401) {
      return 'Invalid email or password. Please check your credentials.';
    }

    if (error.response?.status === 404) {
      return 'Requested resource not found.';
    }

    if (error.response?.status === 500) {
      return 'Internal server error. Please try again later.';
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. Please check your internet connection.';
    }

    if (error.message === 'Network Error') {
      return 'Unable to reach the server. Please check your internet connection.';
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
