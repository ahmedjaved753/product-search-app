'use client';

import { Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SearchFilters } from './SearchFilters';
import { SearchFilters as SearchFiltersType, SearchResult } from '@/lib/types';
import { SearchMetadata } from '@/services/search.service';

interface FilterControlsProps {
    showFilters: boolean;
    onToggleFilters: () => void;
    activeFiltersCount: number;
    filters: SearchFiltersType;
    onFiltersChange: (filters: SearchFiltersType) => void;
    metadata?: SearchMetadata;
    results?: SearchResult;
}

export function FilterControls({
    showFilters,
    onToggleFilters,
    activeFiltersCount,
    filters,
    onFiltersChange,
    metadata,
    results
}: FilterControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Desktop Filters Button */}
            <div className="hidden sm:block">
                <Button
                    variant={showFilters ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleFilters}
                    className="relative"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Mobile Filters Sheet */}
            <div className="sm:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="relative">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                        <SheetHeader>
                            <SheetTitle>Search Filters</SheetTitle>
                            <SheetDescription>
                                Refine your search with advanced filters
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                            {metadata && (
                                <SearchFilters
                                    filters={filters}
                                    onFiltersChange={onFiltersChange}
                                    vendors={metadata.vendors}
                                    productTypes={metadata.productTypes}
                                    priceRange={metadata.priceRange}
                                />
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Results Summary */}
            {results && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                        {results.total.toLocaleString()} results
                    </span>
                </div>
            )}
        </div>
    );
} 