# Services Architecture

This directory contains the service layer for the product search application, implementing TanStack Query best practices for data fetching and caching.

## Structure

```
src/services/
├── README.md                    # This file
├── index.ts                     # Main exports
├── search.service.ts            # Core API functions and configuration
└── queries/
    └── search.queries.ts        # TanStack Query hooks and utilities
```

## Key Components

### 1. Service Functions (`search.service.ts`)

- **Pure API functions** that handle HTTP requests
- **Configuration constants** for cache timing and retry logic
- **Query key factories** for consistent cache management
- **Type definitions** for API parameters and responses

### 2. Query Hooks (`queries/search.queries.ts`)

- **useSearchProducts** - Main search hook with caching
- **useSearchSuggestions** - Autocomplete suggestions
- **useSearchMetadata** - Application metadata (vendors, categories, stats)
- **Helper functions** for prefetching and cache invalidation

### 3. Best Practices Implemented

#### Query Key Management

```typescript
export const searchKeys = {
  all: ["search"] as const,
  lists: () => [...searchKeys.all, "list"] as const,
  list: (params: SearchParams) => [...searchKeys.lists(), params] as const,
  suggestions: (query: string) =>
    [...searchKeys.all, "suggestions", query] as const,
  metadata: () => [...searchKeys.all, "metadata"] as const,
} as const;
```

#### Configuration Management

```typescript
export const SEARCH_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY_COUNT: 2,
  DEBOUNCE_MS: 300,
  DEFAULT_PAGE_SIZE: 20,
} as const;
```

#### Error Handling

- Proper error boundaries with typed error responses
- Retry logic with exponential backoff
- Graceful degradation for non-critical features (suggestions)

#### Performance Optimizations

- **Debounced queries** to prevent excessive API calls
- **Stale-while-revalidate** strategy for instant UX
- **Intelligent cache invalidation** based on query parameters
- **Prefetching capabilities** for predictive loading

## Migration Benefits

### Before (Direct API Calls)

- Scattered fetch logic across components
- Manual loading states and error handling
- No caching strategy
- Duplicate API calls
- Inconsistent error handling

### After (Service Layer + TanStack Query)

- Centralized API logic
- Automatic loading states and error handling
- Intelligent caching with background updates
- Deduplication of identical requests
- Consistent error boundaries
- Type-safe API interactions
- Prefetching and optimistic updates support

## Usage Examples

### Basic Search

```typescript
import { useSearchProducts, SearchParams } from "@/services";

const searchParams: SearchParams = {
  query: "laptop",
  filters: { vendor: "Apple" },
  page: 1,
  sortBy: "price-asc",
};

const { data, isLoading, error } = useSearchProducts(searchParams);
```

### Suggestions with Debouncing

```typescript
import { useSearchSuggestions } from "@/services";
import { useDebounce } from "@/hooks/useDebounce";

const debouncedQuery = useDebounce(query, 200);
const { data: suggestions } = useSearchSuggestions(debouncedQuery);
```

### Cache Management

```typescript
import { invalidateSearchQueries, prefetchSearchResults } from "@/services";

// Invalidate all search cache
invalidateSearchQueries(queryClient);

// Prefetch next page
prefetchSearchResults(queryClient, nextPageParams);
```

## Integration Points

- **Components**: Import hooks directly from `@/services`
- **Pages**: Use metadata hook for initial data loading
- **Search Bar**: Suggestions with automatic debouncing
- **Results**: Paginated search with intelligent caching

This architecture provides a solid foundation for scaling the application while maintaining excellent performance and developer experience.
