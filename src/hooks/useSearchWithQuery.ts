import { useState, useCallback } from "react";
import { SearchFilters, SearchResult } from "@/lib/types";
import { useDebounce } from "./useDebounce";
import { useSearchProducts, SearchParams, SEARCH_CONFIG } from "@/services";

interface UseSearchParams {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  debounceMs?: number;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  results: SearchResult | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  search: () => void;
  clearSearch: () => void;
}

export function useSearchWithQuery({
  initialQuery = "",
  initialFilters = {},
  debounceMs = SEARCH_CONFIG.DEBOUNCE_MS,
}: UseSearchParams = {}): UseSearchReturn {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");

  const debouncedQuery = useDebounce(query, debounceMs);

  // Build search parameters
  const searchParams: SearchParams = {
    query: debouncedQuery,
    filters,
    page,
    sortBy,
  };

  // Use the service layer for data fetching
  const {
    data: results,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useSearchProducts(searchParams);

  const error = queryError ? (queryError as Error).message : null;

  const search = useCallback(() => {
    refetch();
  }, [refetch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setFilters({});
    setPage(1);
    setSortBy("relevance");
  }, []);

  // When filters change, reset to page 1
  const setFiltersWithReset = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const setQueryWithReset = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  }, []);

  return {
    query,
    setQuery: setQueryWithReset,
    filters,
    setFilters: setFiltersWithReset,
    results: results || null,
    loading,
    error,
    page,
    setPage,
    sortBy,
    setSortBy,
    search,
    clearSearch,
  };
}
