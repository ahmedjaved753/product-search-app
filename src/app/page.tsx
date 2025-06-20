'use client';

import { useState, useRef } from 'react';
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
  const resultsRef = useRef<HTMLDivElement>(null);

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

  // Enhanced page change handler with auto-scroll
  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    // Auto-scroll to results section for better UX
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

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
        <div ref={resultsRef}>
          <ResultsSection
            results={results || null}
            loading={loading}
            error={error || null}
            page={page}
            onPageChange={handlePageChange}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

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
