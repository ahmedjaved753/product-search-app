'use client';

import { SearchResult } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { Package, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchResultsProps {
    results: SearchResult | null;
    loading: boolean;
    error: string | null;
    page: number;
    onPageChange: (page: number) => void;
}

export function SearchResults({
    results,
    loading,
    error,
    page,
    onPageChange
}: SearchResultsProps) {
    // Loading state
    if (loading && !results) {
        return <LoadingGrid />;
    }

    // Error state
    if (error && !results) {
        return (
            <Card className="max-w-md mx-auto border-destructive/50 bg-destructive/5">
                <CardContent className="pt-12 pb-12 text-center space-y-4">
                    <div className="relative">
                        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-ping" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-red-900">Search Error</h3>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // No results state
    if (results && results.products.length === 0) {
        return (
            <Card className="max-w-lg mx-auto border-dashed border-2">
                <CardContent className="pt-12 pb-12 text-center space-y-6">
                    <div className="relative">
                        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Package className="h-10 w-10 text-slate-400" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <Search className="h-3 w-3 text-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900">No Products Found</h3>
                        <p className="text-slate-600 max-w-sm mx-auto">
                            We couldn&apos;t find any products matching your search. Try adjusting your filters or search terms.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Suggestions:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Badge variant="outline" className="text-xs">Check spelling</Badge>
                            <Badge variant="outline" className="text-xs">Try broader terms</Badge>
                            <Badge variant="outline" className="text-xs">Remove filters</Badge>
                            <Badge variant="outline" className="text-xs">Browse categories</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Results
    if (!results) {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* Products Grid */}
            <div className="relative">


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.products.map((product, index) => (
                        <div
                            key={product.id}
                            className="animate-in fade-in-0 slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <ProductCard
                                product={product}
                                loading={loading}
                            />
                        </div>
                    ))}
                </div>

                {/* Loading overlay for existing results */}
                {loading && results.products.length > 0 && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-slate-900">Updating results...</p>
                                        <p className="text-sm text-slate-600">AI is finding the best matches</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {results.totalPages > 1 && (
                <div className="flex justify-center pt-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                            <Pagination
                                currentPage={page}
                                totalPages={results.totalPages}
                                onPageChange={onPageChange}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Global loading overlay for page changes */}
            {loading && results.products.length > 0 && page !== results.page && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardContent className="p-8">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-t-blue-600"></div>
                                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-pulse"></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold text-slate-900">Loading Page {page}...</p>
                                    <p className="text-sm text-slate-600">Finding amazing products for you</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
} 