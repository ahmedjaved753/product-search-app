'use client';

import { Search, Package, Users, Grid3X3 } from 'lucide-react';
import { SearchMetadata } from '@/services/search.service';

interface HeaderProps {
    metadata?: SearchMetadata;
}

export function Header({ metadata }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                                    <Search className="h-5 w-5 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Product Discovery
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Search across brands & categories
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats - Desktop */}
                    {metadata && (
                        <div className="hidden lg:flex items-center space-x-8">
                            <div className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                    <Package className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {metadata.stats.totalProducts.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">Products</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                                    <Users className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {metadata.stats.uniqueVendors}
                                    </p>
                                    <p className="text-xs text-slate-500">Brands</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                                    <Grid3X3 className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {metadata.stats.uniqueProductTypes}
                                    </p>
                                    <p className="text-xs text-slate-500">Categories</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
} 