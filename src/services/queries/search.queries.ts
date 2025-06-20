import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  searchProducts,
  getSearchSuggestions,
  getSearchMetadata,
  searchKeys,
  SEARCH_CONFIG,
  SearchParams,
  SearchMetadata,
} from "../search.service";
import { SearchResult } from "@/lib/types";

/**
 * Hook for searching products with TanStack Query
 */
export function useSearchProducts(
  params: SearchParams,
  options?: Partial<UseQueryOptions<SearchResult, Error>>
) {
  return useQuery({
    queryKey: searchKeys.list(params),
    queryFn: () => searchProducts(params),
    enabled:
      params.query.trim().length > 0 || Object.keys(params.filters).length > 0,
    staleTime: SEARCH_CONFIG.STALE_TIME,
    gcTime: SEARCH_CONFIG.GC_TIME,
    retry: SEARCH_CONFIG.RETRY_COUNT,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}

/**
 * Hook for getting search suggestions with TanStack Query
 */
export function useSearchSuggestions(
  query: string,
  options?: Partial<UseQueryOptions<string[], Error>>
) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => getSearchSuggestions(query),
    enabled: query.trim().length >= 2, // Only fetch suggestions for 2+ characters
    staleTime: SEARCH_CONFIG.STALE_TIME,
    gcTime: SEARCH_CONFIG.GC_TIME,
    retry: 1, // Less retries for suggestions as they're not critical
    ...options,
  });
}

/**
 * Hook for getting search metadata with TanStack Query
 */
export function useSearchMetadata(
  options?: Partial<UseQueryOptions<SearchMetadata, Error>>
) {
  return useQuery({
    queryKey: searchKeys.metadata(),
    queryFn: getSearchMetadata,
    staleTime: 10 * 60 * 1000, // 10 minutes - metadata changes less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - keep metadata longer
    retry: SEARCH_CONFIG.RETRY_COUNT,
    ...options,
  });
}

/**
 * Helper function to prefetch search results
 * Useful for optimistic prefetching based on user behavior
 */
export const prefetchSearchResults = (
  queryClient: {
    prefetchQuery: (options: Record<string, unknown>) => Promise<void>;
  },
  params: SearchParams
) => {
  return queryClient.prefetchQuery({
    queryKey: searchKeys.list(params),
    queryFn: () => searchProducts(params),
    staleTime: SEARCH_CONFIG.STALE_TIME,
  });
};

/**
 * Helper function to invalidate all search-related queries
 * Useful when data changes and we need to refresh all search results
 */
export const invalidateSearchQueries = (queryClient: {
  invalidateQueries: (options: Record<string, unknown>) => Promise<void>;
}) => {
  return queryClient.invalidateQueries({
    queryKey: searchKeys.all,
  });
};

/**
 * Helper function to invalidate specific search results
 * Useful for targeted cache invalidation
 */
export const invalidateSearchResults = (
  queryClient: {
    invalidateQueries: (options: Record<string, unknown>) => Promise<void>;
  },
  params?: Partial<SearchParams>
) => {
  if (params) {
    return queryClient.invalidateQueries({
      queryKey: searchKeys.lists(),
      predicate: (query: { queryKey: unknown[] }) => {
        const queryParams = query.queryKey[2] as SearchParams;
        return (
          (!params.query || queryParams.query === params.query) &&
          (!params.sortBy || queryParams.sortBy === params.sortBy) &&
          (!params.filters ||
            JSON.stringify(queryParams.filters) ===
              JSON.stringify(params.filters))
        );
      },
    });
  }

  return queryClient.invalidateQueries({
    queryKey: searchKeys.lists(),
  });
};
