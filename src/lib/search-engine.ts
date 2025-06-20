import Fuse from "fuse.js";
import { Product, SearchFilters, SearchResult } from "./types";

export class SearchEngine {
  private fuse: Fuse<Product> | null = null;
  private products: Product[] = [];

  constructor(products: Product[]) {
    this.products = products;
    this.initializeFuse();
  }

  private initializeFuse() {
    const options = {
      keys: [
        { name: "title", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "vendor", weight: 0.2 },
        { name: "productType", weight: 0.1 },
        { name: "tags", weight: 0.1 },
      ],
      threshold: 0.3, // Lower threshold = more strict matching
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      findAllMatches: true,
    };

    this.fuse = new Fuse(this.products, options);
  }

  search(
    query: string,
    filters: SearchFilters = {},
    page = 1,
    limit = 20,
    sortBy:
      | "relevance"
      | "price-asc"
      | "price-desc"
      | "name-asc"
      | "name-desc"
      | "newest" = "relevance"
  ): SearchResult {
    const startTime = Date.now();

    let results: Product[] = [];

    // If no query, return all products (filtered)
    if (!query.trim()) {
      results = this.products;
    } else {
      // Perform fuzzy search
      const fuseResults = this.fuse?.search(query) || [];
      results = fuseResults.map((result) => result.item);
    }

    // Apply filters
    results = this.applyFilters(results, filters);

    // Apply sorting
    results = this.applySorting(results, sortBy);

    // Calculate pagination
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    const processingTime = Date.now() - startTime;

    return {
      products: paginatedResults,
      total,
      page,
      limit,
      totalPages,
      processingTime,
    };
  }

  private applyFilters(products: Product[], filters: SearchFilters): Product[] {
    let filtered = products;

    // Vendor filter
    if (filters.vendor) {
      filtered = filtered.filter((product) =>
        product.vendor.toLowerCase().includes(filters.vendor!.toLowerCase())
      );
    }

    // Product type filter
    if (filters.productType) {
      filtered = filtered.filter((product) =>
        product.productType
          .toLowerCase()
          .includes(filters.productType!.toLowerCase())
      );
    }

    // Price range filters
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((product) => {
        const price = product.price || product.priceRange?.max || 0;
        return price >= filters.minPrice!;
      });
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((product) => {
        const price = product.price || product.priceRange?.min || 0;
        return price <= filters.maxPrice!;
      });
    }

    // In stock filter
    if (filters.inStock) {
      filtered = filtered.filter(
        (product) =>
          (product.totalInventory || 0) > 0 && !product.hasOutOfStockVariants
      );
    }

    return filtered;
  }

  private applySorting(products: Product[], sortBy: string): Product[] {
    const sorted = [...products];

    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => {
          const priceA = a.price || a.priceRange?.min;
          const priceB = b.price || b.priceRange?.min;

          // If both have no price, maintain original order
          if (!priceA && !priceB) return 0;

          // Products without prices go to the end
          if (!priceA) return 1;
          if (!priceB) return -1;

          // Both have prices, sort normally
          return priceA - priceB;
        });

      case "price-desc":
        return sorted.sort((a, b) => {
          const priceA = a.price || a.priceRange?.max;
          const priceB = b.price || b.priceRange?.max;

          // If both have no price, maintain original order
          if (!priceA && !priceB) return 0;

          // Products without prices go to the end
          if (!priceA) return 1;
          if (!priceB) return -1;

          // Both have prices, sort normally
          return priceB - priceA;
        });

      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      case "name-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));

      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case "relevance":
      default:
        return sorted; // Fuse.js already sorts by relevance
    }
  }

  getUniqueVendors(): string[] {
    const vendors = new Set(
      this.products
        .map((product) => product.vendor)
        .filter((vendor) => vendor && vendor.trim() !== "")
    );
    return Array.from(vendors).sort();
  }

  getUniqueProductTypes(): string[] {
    const types = new Set(
      this.products
        .map((product) => product.productType)
        .filter((type) => type && type.trim() !== "")
    );
    return Array.from(types).sort();
  }

  private getProductPrice(product: Product): number {
    return product.price || product.priceRange?.max || 0;
  }

  /**
   * Check if a product has a valid price for sorting purposes
   */
  private hasValidPrice(product: Product): boolean {
    return !!(
      product.price ||
      product.priceRange?.min ||
      product.priceRange?.max
    );
  }

  getPriceRange(): { min: number; max: number } {
    const prices = this.products
      .map((product) => this.getProductPrice(product))
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  getSearchSuggestions(query: string, limit = 5): string[] {
    if (!query.trim() || query.length < 2) return [];

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    // Add title suggestions
    this.products.forEach((product) => {
      const title = product.title.toLowerCase();
      if (title.includes(lowerQuery)) {
        suggestions.add(product.title);
      }
    });

    // Add vendor suggestions
    this.products.forEach((product) => {
      const vendor = product.vendor.toLowerCase();
      if (vendor.includes(lowerQuery)) {
        suggestions.add(product.vendor);
      }
    });

    // Add product type suggestions
    this.products.forEach((product) => {
      const type = product.productType.toLowerCase();
      if (type.includes(lowerQuery)) {
        suggestions.add(product.productType);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  updateProducts(products: Product[]) {
    this.products = products;
    this.initializeFuse();
  }

  getStats() {
    const totalPrice = this.products.reduce(
      (sum, product) => sum + this.getProductPrice(product),
      0
    );
    return {
      totalProducts: this.products.length,
      uniqueVendors: this.getUniqueVendors().length,
      uniqueProductTypes: this.getUniqueProductTypes().length,
      priceRange: this.getPriceRange(),
      avgPrice:
        this.products.length > 0 ? totalPrice / this.products.length : 0,
    };
  }
}
