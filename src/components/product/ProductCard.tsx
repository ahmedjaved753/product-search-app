'use client';

import { Product } from '@/lib/types';
import { Package2, Tag, ExternalLink, DollarSign, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: Product;
    loading?: boolean;
}

export function ProductCard({ product, loading = false }: ProductCardProps) {
    const formatPrice = (product: Product) => {
        // Check if we have valid price range data
        if (!product.priceRange || (product.priceRange.min === 0 && product.priceRange.max === 0)) {
            return 'Price not available';
        }

        const { min, max } = product.priceRange;

        // If min and max are the same, show single price
        if (min === max) {
            return `$${min.toFixed(2)}`;
        }

        // If we have a range, show it in a more professional way
        if (min > 0 && max > min) {
            const difference = max - min;

            // For small differences (< $5), show full range
            if (difference < 5) {
                return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
            }

            // For larger differences, show "from" format for cleaner look
            return `From $${min.toFixed(2)}`;
        }

        // If only max is available
        if (max > 0) {
            return `$${max.toFixed(2)}`;
        }

        return 'Price not available';
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    const getStockStatus = () => {
        const inventory = product.totalInventory || 0;
        if (inventory === 0 || product.hasOutOfStockVariants) {
            return { status: 'Out of Stock', variant: 'destructive' as const, color: 'text-red-600' };
        }
        if (inventory < 10) {
            return { status: 'Low Stock', variant: 'secondary' as const, color: 'text-yellow-600' };
        }
        return { status: 'In Stock', variant: 'default' as const, color: 'text-green-600' };
    };

    const stockInfo = getStockStatus();

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/50",
            loading && "opacity-50 animate-pulse"
        )}>
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                {product.featuredImage ? (
                    <Image
                        src={product.featuredImage}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package2 className="h-16 w-16 text-slate-300" />
                    </div>
                )}

                {/* Overlay Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Stock Badge */}
                <div className="absolute top-3 right-3">
                    <Badge variant={stockInfo.variant} className="shadow-sm backdrop-blur-sm">
                        {stockInfo.status}
                    </Badge>
                </div>

                {/* Gift Card Badge */}
                {product.isGiftCard && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                            <Star className="h-3 w-3 mr-1" />
                            Gift Card
                        </Badge>
                    </div>
                )}

                {/* Price Overlay */}
                <div className="absolute bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex items-center space-x-1 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 shadow-sm">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-sm font-semibold text-slate-900">
                            {formatPrice(product)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <CardContent className="p-4 space-y-3">
                {/* Vendor */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                            {product.vendor || 'Unknown Vendor'}
                        </span>
                    </div>
                    {product.productType && (
                        <Badge variant="outline" className="text-xs">
                            {product.productType}
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <CardTitle className="text-base font-semibold text-slate-900 leading-tight line-clamp-2 min-h-[2.5rem]">
                    {truncateText(product.title, 60)}
                </CardTitle>

                {/* Description */}
                {product.description && (
                    <CardDescription className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
                        {truncateText(product.description, 100)}
                    </CardDescription>
                )}

                <Separator className="my-3" />

                {/* Price and Actions */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-lg font-bold text-slate-900">
                                {formatPrice(product)}
                            </span>
                        </div>

                        {(product.totalInventory || 0) > 0 && (
                            <span className="text-xs text-slate-500">
                                {product.totalInventory} in stock
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        {product.onlineStoreUrl && (
                            <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
                                asChild
                            >
                                <a
                                    href={product.onlineStoreUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ShoppingCart className="h-3 w-3 mr-2" />
                                    View Product
                                </a>
                            </Button>
                        )}

                        {product.shopUrl && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-slate-200 hover:bg-slate-50"
                                asChild
                            >
                                <a
                                    href={product.shopUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Shop
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono">ID: {product.id}</span>
                        {product.createdAt && (
                            <span>
                                Added {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 