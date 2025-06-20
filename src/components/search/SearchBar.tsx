'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { cn } from '@/lib/utils';
import { useSearchSuggestions } from '@/services';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
    query: string;
    onQueryChange: (query: string) => void;
    onClear: () => void;
    loading?: boolean;
}

export function SearchBar({ query, onQueryChange, onClear, loading = false }: SearchBarProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const suppressSuggestionsRef = useRef(false);

    // Debounce query for suggestions to avoid too many API calls
    const debouncedQuery = useDebounce(query, 200);

    // Use the service layer for suggestions
    const {
        data: suggestions = [],
        isLoading: suggestionsLoading,
    } = useSearchSuggestions(debouncedQuery);

    // Show suggestions when we have data and input is focused
    useEffect(() => {
        if (suggestions.length > 0 && isFocused && debouncedQuery.length > 1 && !suppressSuggestionsRef.current) {
            setShowSuggestions(true);
        } else if (!suppressSuggestionsRef.current) {
            setShowSuggestions(false);
        }
    }, [suggestions, isFocused, debouncedQuery]);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSuggestionClick = (suggestion: string) => {
        // Immediately hide suggestions and prevent them from showing
        setShowSuggestions(false);
        setIsFocused(false);
        suppressSuggestionsRef.current = true;

        // Update the query
        onQueryChange(suggestion);

        // Reset everything after a delay to allow the query to process
        setTimeout(() => {
            suppressSuggestionsRef.current = false;
            inputRef.current?.focus();
            // Don't set isFocused back to true here - let the focus event handle it
        }, 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className="relative">
            {/* Search Input Container */}
            <div className={cn(
                "relative group transition-all duration-300",
                isFocused && "scale-[1.02]"
            )}>
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Input Container */}
                <div className="relative bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-slate-300/60">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {loading ? (
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        ) : (
                            <Search className={cn(
                                "h-5 w-5 transition-colors duration-200",
                                isFocused ? "text-blue-500" : "text-slate-400"
                            )} />
                        )}
                    </div>

                    <Input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            suppressSuggestionsRef.current = false;
                            onQueryChange(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            setIsFocused(true);
                            if (suggestions.length > 0 && debouncedQuery.length > 1) {
                                setShowSuggestions(true);
                            }
                        }}
                        onBlur={() => {
                            // Delay hiding suggestions to allow click events to process
                            setTimeout(() => {
                                if (!suppressSuggestionsRef.current) {
                                    setIsFocused(false);
                                    setShowSuggestions(false);
                                }
                            }, 150);
                        }}
                        placeholder="Search products by name, brand, or category..."
                        className="w-full pl-12 pr-12 py-6 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
                        autoComplete="off"
                    />

                    {query && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="absolute inset-y-0 right-2 my-auto h-8 w-8 p-0 hover:bg-slate-100 transition-colors"
                            type="button"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4 text-slate-400" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <Card
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-3 border-0 shadow-2xl bg-white/95 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200"
                >
                    <CardContent className="p-0">
                        {suggestionsLoading ? (
                            <div className="px-4 py-4 flex items-center space-x-3 text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                <span className="text-sm">Finding suggestions...</span>
                            </div>
                        ) : suggestions.length > 0 ? (
                            <>
                                {suggestions.map((suggestion, index) => (
                                    <Button
                                        key={index}
                                        variant="ghost"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent input blur
                                            handleSuggestionClick(suggestion);
                                        }}
                                        className="w-full justify-start px-4 py-4 h-auto text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-none border-b border-slate-50 last:border-b-0 transition-all duration-200"
                                    >
                                        <div className="flex items-center space-x-3 w-full">
                                            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span className="text-slate-900 flex-1 text-left">{suggestion}</span>
                                            <div className="h-2 w-2 rounded-full bg-blue-500/20" />
                                        </div>
                                    </Button>
                                ))}
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 