'use client';

import { useState } from 'react';
import { useSearchWithQuery } from '@/hooks/useSearchWithQuery';
import { useSearchMetadata } from '@/services';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/search/HeroSection';
import { FilterControls } from '@/components/search/FilterControls';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { ResultsSection } from '@/components/search/ResultsSection';
import { WelcomeSection } from '@/components/search/WelcomeSection';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const [showFilters, setShowFilters] = useState(false);

  // Use the service layer for metadata
  const {
    data: metadata,
    isLoading: metadataLoading,
  } = useSearchMetadata();

  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    error,
    page,
    setPage,
    sortBy,
    setSortBy,
    clearSearch
  } = useSearchWithQuery();

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      {/* Header */}
      <Header metadata={metadata} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Search Section */}
        <HeroSection
          query={query}
          onQueryChange={setQuery}
          onClear={clearSearch}
          loading={loading}
        />

        {/* Filter Controls */}
        <FilterControls
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          activeFiltersCount={activeFiltersCount}
          filters={filters}
          onFiltersChange={setFilters}
          metadata={metadata}
          results={results ?? undefined}
        />

        {/* Desktop Filters */}
        {showFilters && metadata && (
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            metadata={metadata}
          />
        )}

        <Separator className="max-w-4xl mx-auto" />

        {/* Results Section */}
        <ResultsSection
          results={results || null}
          loading={loading}
          error={error || null}
          page={page}
          onPageChange={setPage}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Welcome State */}
        {!query && !loading && !results && !metadataLoading && (
          <WelcomeSection
            metadata={metadata}
            onBrandClick={setQuery}
          />
        )}
      </main>
    </div>
  );
}
