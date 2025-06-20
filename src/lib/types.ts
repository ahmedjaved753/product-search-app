export interface Product {
  id: string;
  title: string;
  handle?: string;
  vendor: string;
  description: string;
  productType: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  priceRange: {
    min: number;
    max: number;
  };
  images: string[];
  // Additional fields for compatibility
  descriptionHtml?: string;
  totalInventory?: number;
  price?: number;
  featuredImage?: string;
  variants?: Record<string, unknown>[];
  isGiftCard?: boolean;
  hasOutOfStockVariants?: boolean;
  onlineStoreUrl?: string;
  shopUrl?: string;
  seo?: {
    title?: string;
    description?: string;
  };
}

export interface SearchFilters {
  vendor?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  processingTime: number;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  processed: number;
  total: number;
  progress: number;
  message: string;
}
