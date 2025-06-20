'use client';

import { SearchFilters } from './SearchFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchFilters as SearchFiltersType } from '@/lib/types';
import { SearchMetadata } from '@/services/search.service';

interface AdvancedFiltersProps {
    filters: SearchFiltersType;
    onFiltersChange: (filters: SearchFiltersType) => void;
    metadata: SearchMetadata;
}

export function AdvancedFilters({ filters, onFiltersChange, metadata }: AdvancedFiltersProps) {
    return (
        <div className="hidden sm:block">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-lg">Advanced Filters</CardTitle>
                    <CardDescription>
                        Narrow down your search with specific criteria
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SearchFilters
                        filters={filters}
                        onFiltersChange={onFiltersChange}
                        vendors={metadata.vendors}
                        productTypes={metadata.productTypes}
                        priceRange={metadata.priceRange}
                    />
                </CardContent>
            </Card>
        </div>
    );
} 