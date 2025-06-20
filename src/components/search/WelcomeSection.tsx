'use client';

import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchMetadata } from '@/services/search.service';

interface WelcomeSectionProps {
    metadata?: SearchMetadata;
    onBrandClick: (brand: string) => void;
}

export function WelcomeSection({ metadata, onBrandClick }: WelcomeSectionProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <Card className="border-dashed border-2 bg-gradient-to-br from-slate-50/50 to-white">
                <CardContent className="pt-12 pb-12 text-center space-y-6">
                    <div className="relative">
                        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <Search className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Start Your Discovery Journey</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Search through {metadata?.stats.totalProducts.toLocaleString()} products
                            from {metadata?.stats.uniqueVendors} brands across {metadata?.stats.uniqueProductTypes} categories
                        </p>
                    </div>

                    {/* Popular Brands */}
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground">Popular Brands</p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                            {metadata?.vendors.slice(0, 8).map((vendor) => (
                                <Button
                                    key={vendor}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onBrandClick(vendor)}
                                    className="h-8 text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
                                >
                                    {vendor}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 