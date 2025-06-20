'use client';

export function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
                    {/* Image Skeleton */}
                    <div className="aspect-square bg-gray-200"></div>

                    {/* Content Skeleton */}
                    <div className="p-4 space-y-3">
                        {/* Vendor */}
                        <div className="h-3 bg-gray-200 rounded w-24"></div>

                        {/* Title */}
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        </div>

                        {/* Price */}
                        <div className="h-6 bg-gray-200 rounded w-20"></div>

                        {/* Category */}
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>

                        {/* Button */}
                        <div className="h-9 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            ))}
        </div>
    );
} 