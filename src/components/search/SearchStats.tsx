'use client';

import { SearchResult } from '@/lib/types';
import { ArrowUpDown, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchStatsProps {
    results: SearchResult;
    sortBy: string;
    onSortChange: (sortBy: string) => void;
}

export function SearchStats({ results, sortBy, onSortChange }: SearchStatsProps) {
    const sortOptions = [
        { value: 'relevance', label: 'Best Match', icon: '🎯' },
        { value: 'name-asc', label: 'Name A-Z', icon: '📝' },
        { value: 'name-desc', label: 'Name Z-A', icon: '📄' },
        { value: 'price-asc', label: 'Price Low to High', icon: '💰' },
        { value: 'price-desc', label: 'Price High to Low', icon: '💎' },
        { value: 'newest', label: 'Newest First', icon: '✨' }
    ];

    const startIndex = (results.page - 1) * results.limit + 1;
    const endIndex = Math.min(results.page * results.limit, results.total);

    return (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50/50 to-white">
            <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Results info */}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-slate-700">
                                    Results
                                </span>
                            </div>
                            <div className="text-sm text-slate-600">
                                <span className="font-semibold text-slate-900">
                                    {startIndex.toLocaleString()}-{endIndex.toLocaleString()}
                                </span>
                                {' '}of{' '}
                                <span className="font-semibold text-slate-900">
                                    {results.total.toLocaleString()}
                                </span>
                            </div>
                        </div>


                    </div>

                    {/* Sort options */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <ArrowUpDown className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Sort by</span>
                        </div>

                        <Select value={sortBy} onValueChange={onSortChange}>
                            <SelectTrigger className="w-48 h-9 text-sm">
                                <SelectValue placeholder="Choose sorting..." />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span>{option.icon}</span>
                                            <span>{option.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 