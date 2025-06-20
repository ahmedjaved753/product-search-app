'use client';

import { SearchFilters as SearchFiltersType } from '@/lib/types';
import { X, Filter, Tag, DollarSign, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


interface SearchFiltersProps {
    filters: SearchFiltersType;
    onFiltersChange: (filters: SearchFiltersType) => void;
    vendors: string[];
    productTypes: string[];
    priceRange: { min: number; max: number };
}

export function SearchFilters({
    filters,
    onFiltersChange,
    vendors,
    productTypes,
    priceRange
}: SearchFiltersProps) {
    const updateFilter = (key: keyof SearchFiltersType, value: string | number | boolean | undefined) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const removeFilter = (key: keyof SearchFiltersType) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        onFiltersChange({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <div className="space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Advanced Filters</h3>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-slate-600 hover:text-slate-900"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear all
                    </Button>
                )}
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vendor Filter */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                            <Tag className="h-4 w-4 text-blue-600" />
                            <span>Brand</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Select
                            value={filters.vendor || 'all-brands'}
                            onValueChange={(value) => updateFilter('vendor', value === 'all-brands' ? undefined : value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All brands" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-brands">All brands</SelectItem>
                                {vendors.slice(0, 50).filter(vendor => vendor && vendor.trim()).map((vendor) => (
                                    <SelectItem key={vendor} value={vendor}>
                                        {vendor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {filters.vendor && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFilter('vendor')}
                                className="w-full h-8 text-xs text-slate-500 hover:text-slate-700"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear brand
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Product Type Filter */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                            <Package className="h-4 w-4 text-emerald-600" />
                            <span>Category</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Select
                            value={filters.productType || 'all-categories'}
                            onValueChange={(value) => updateFilter('productType', value === 'all-categories' ? undefined : value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all-categories">All categories</SelectItem>
                                {productTypes.slice(0, 50).filter(type => type && type.trim()).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {filters.productType && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFilter('productType')}
                                className="w-full h-8 text-xs text-slate-500 hover:text-slate-700"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear category
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Price Range Filter */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            <span>Price Range</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            ${priceRange.min} - ${priceRange.max}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="minPrice" className="text-xs text-slate-600">Min</Label>
                                <Input
                                    id="minPrice"
                                    type="number"
                                    placeholder="0"
                                    value={filters.minPrice || ''}
                                    onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxPrice" className="text-xs text-slate-600">Max</Label>
                                <Input
                                    id="maxPrice"
                                    type="number"
                                    placeholder={priceRange.max.toString()}
                                    value={filters.maxPrice || ''}
                                    onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                        {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    removeFilter('minPrice');
                                    removeFilter('maxPrice');
                                }}
                                className="w-full h-8 text-xs text-slate-500 hover:text-slate-700"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear price
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Stock Filter */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Availability</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="inStock"
                                checked={filters.inStock || false}
                                onCheckedChange={(checked: boolean) => updateFilter('inStock', checked || undefined)}
                            />
                            <Label
                                htmlFor="inStock"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                In stock only
                            </Label>
                        </div>
                        {filters.inStock && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFilter('inStock')}
                                className="w-full h-8 text-xs text-slate-500 hover:text-slate-700 mt-2"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear availability
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="space-y-3">
                    <Separator />
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700">Active Filters</h4>
                        <div className="flex flex-wrap gap-2">
                            {filters.vendor && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {filters.vendor}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter('vendor')}
                                        className="ml-1 h-4 w-4 p-0 hover:bg-blue-300"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {filters.productType && (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                    <Package className="h-3 w-3 mr-1" />
                                    {filters.productType}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter('productType')}
                                        className="ml-1 h-4 w-4 p-0 hover:bg-emerald-300"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    ${filters.minPrice || priceRange.min} - ${filters.maxPrice || priceRange.max}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            removeFilter('minPrice');
                                            removeFilter('maxPrice');
                                        }}
                                        className="ml-1 h-4 w-4 p-0 hover:bg-purple-300"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {filters.inStock && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    In stock only
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFilter('inStock')}
                                        className="ml-1 h-4 w-4 p-0 hover:bg-green-300"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 