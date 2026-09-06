import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface GlobalSearchResultItem {
  id: string;
  type: string;
  student_id?: number | string | null;
  batch_id?: number | string | null;
  title: string;
  subtitle: string;
  meta: string;
  image?: string | null;
}

export interface GlobalSearchData {
  query: string;
  total: number;
  results: GlobalSearchResultItem[];
}

export interface GlobalSearchResponse {
  status: string;
  message: string;
  data: GlobalSearchData;
}

export const searchApi = {
  search: async (query: string, limit: number = 20): Promise<GlobalSearchData> => {
    const response = await apiClient.get<GlobalSearchResponse>(ENDPOINTS.search, {
      params: { q: query, limit },
    });
    return response.data.data;
  },
};
