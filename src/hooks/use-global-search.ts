import { useQuery } from '@tanstack/react-query';
import { searchApi, GlobalSearchData } from '@/api/search.api';

export function useGlobalSearch(query: string, limit: number = 20) {
  const cleanQuery = query.trim();
  const enabled = cleanQuery.length >= 2;

  return useQuery<GlobalSearchData, Error>({
    queryKey: ['global-search', cleanQuery, limit],
    queryFn: async () => {
      return await searchApi.search(cleanQuery, limit);
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds
  });
}
