'use client';

import { SearchBar } from './SearchBar';

interface HeroSectionProps {
    query: string;
    onQueryChange: (query: string) => void;
    onClear: () => void;
    loading: boolean;
}

export function HeroSection({ query, onQueryChange, onClear, loading }: HeroSectionProps) {
    return (
        <div className="relative">
            <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                        Discover Amazing Products
                    </h2>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Search through thousands of products with intelligent filtering and instant results
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <SearchBar
                        query={query}
                        onQueryChange={onQueryChange}
                        onClear={onClear}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
} 