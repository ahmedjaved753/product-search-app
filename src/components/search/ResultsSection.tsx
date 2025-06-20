'use client';

import { SearchStats } from './SearchStats';
import { SearchResults } from './SearchResults';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { SearchResult } from '@/lib/types';

interface ResultsSectionProps {
    results: SearchResult | null;
    loading: boolean;
    error: string | null;
    page: number;
    onPageChange: (page: number) => void;
    sortBy: string;
    onSortChange: (sortBy: string) => void;
}

export function ResultsSection({
    results,
    loading,
    error,
    page,
    onPageChange,
    sortBy,
    onSortChange
}: ResultsSectionProps) {
    return (
        <div className="space-y-6">
            {/* Search Stats */}
            {results && (
                <SearchStats
                    results={results}
                    sortBy={sortBy}
                    onSortChange={onSortChange}
                />
            )}

            {/* Error State */}
            {error && (
                <Card className="max-w-4xl mx-auto border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                            <CardTitle className="text-lg text-destructive">Search Error</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            <SearchResults
                results={results}
                loading={loading}
                error={error}
                page={page}
                onPageChange={onPageChange}
            />
        </div>
    );
} 