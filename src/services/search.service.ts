import { SearchResult, SearchFilters } from "@/lib/types";

/**
 * Search service configuration
 */
export const SEARCH_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY_COUNT: 2,
  DEBOUNCE_MS: 300,
  DEFAULT_PAGE_SIZE: 20,
} as const;

/**
 * Search API parameters interface
 */
export interface SearchParams {
  query: string;
  filters: SearchFilters;
  page: number;
  sortBy: string;
  limit?: number;
}

/**
 * Generate query key for search operations
 * This ensures proper cache invalidation and deduplication
 */
export const searchKeys = {
  all: ["search"] as const,
  lists: () => [...searchKeys.all, "list"] as const,
  list: (params: Omit<SearchParams, "limit">) =>
    [...searchKeys.lists(), params] as const,
  suggestions: (query: string) =>
    [...searchKeys.all, "suggestions", query] as const,
  metadata: () => [...searchKeys.all, "metadata"] as const,
} as const;

/**
 * Build URL search parameters from search params
 */
const buildSearchParams = (params: SearchParams): URLSearchParams => {
  const urlParams = new URLSearchParams({
    q: params.query.trim(),
    page: params.page.toString(),
    limit: (params.limit || SEARCH_CONFIG.DEFAULT_PAGE_SIZE).toString(),
    sortBy: params.sortBy,
  });

  // Add filters to params
  if (params.filters.vendor) {
    urlParams.append("vendor", params.filters.vendor);
  }
  if (params.filters.productType) {
    urlParams.append("productType", params.filters.productType);
  }
  if (params.filters.minPrice !== undefined) {
    urlParams.append("minPrice", params.filters.minPrice.toString());
  }
  if (params.filters.maxPrice !== undefined) {
    urlParams.append("maxPrice", params.filters.maxPrice.toString());
  }
  if (params.filters.inStock) {
    urlParams.append("inStock", "true");
  }

  return urlParams;
};

/**
 * Search products API call
 * Core function that makes the actual HTTP request
 */
export const searchProducts = async (
  params: SearchParams
): Promise<SearchResult> => {
  const urlParams = buildSearchParams(params);

  const response = await fetch(`/api/search?${urlParams.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Search request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Search failed");
  }

  return data.data;
};

/**
 * Get search suggestions API call
 */
export const getSearchSuggestions = async (
  query: string
): Promise<string[]> => {
  if (!query.trim()) {
    return [];
  }

  const response = await fetch(
    `/api/suggestions?q=${encodeURIComponent(query.trim())}`
  );

  if (!response.ok) {
    throw new Error(
      `Suggestions request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to get suggestions");
  }

  return data.data;
};

/**
 * Get search metadata API call
 */
export interface SearchMetadata {
  vendors: string[];
  productTypes: string[];
  priceRange: { min: number; max: number };
  stats: {
    totalProducts: number;
    uniqueVendors: number;
    uniqueProductTypes: number;
    priceRange: { min: number; max: number };
    avgPrice: number;
  };
}

export const getSearchMetadata = async (): Promise<SearchMetadata> => {
  const response = await fetch("/api/metadata");

  if (!response.ok) {
    throw new Error(
      `Metadata request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to get metadata");
  }

  return data.data;
};
