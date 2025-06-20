import { SearchEngine } from "../search-engine";
import { Product, SearchFilters } from "../types";

describe("SearchEngine", () => {
  const mockProducts: Product[] = [
    {
      id: "1",
      title: "iPhone 14 Pro",
      vendor: "Apple",
      productType: "Smartphone",
      description: "Latest iPhone with advanced camera system",
      handle: "iphone-14-pro",
      status: "active",
      priceRange: { min: 999, max: 1199 },
      images: ["iphone1.jpg"],
      tags: ["electronics", "phone", "apple"],
      createdAt: "2023-01-01",
      updatedAt: "2023-01-02",
      publishedAt: "2023-01-03",
      totalInventory: 50,
      hasOutOfStockVariants: false,
      isGiftCard: false,
    },
    {
      id: "2",
      title: "Samsung Galaxy S23",
      vendor: "Samsung",
      productType: "Smartphone",
      description: "Flagship Android phone with excellent display",
      handle: "samsung-galaxy-s23",
      status: "active",
      priceRange: { min: 799, max: 999 },
      images: ["samsung1.jpg"],
      tags: ["electronics", "phone", "android"],
      createdAt: "2023-02-01",
      updatedAt: "2023-02-02",
      publishedAt: "2023-02-03",
      totalInventory: 0,
      hasOutOfStockVariants: true,
      isGiftCard: false,
    },
    {
      id: "3",
      title: 'MacBook Pro 16"',
      vendor: "Apple",
      productType: "Laptop",
      description: "Professional laptop for creative work",
      handle: "macbook-pro-16",
      status: "active",
      priceRange: { min: 2499, max: 3999 },
      images: ["macbook1.jpg"],
      tags: ["electronics", "laptop", "apple"],
      createdAt: "2023-03-01",
      updatedAt: "2023-03-02",
      publishedAt: "2023-03-03",
      totalInventory: 25,
      hasOutOfStockVariants: false,
      isGiftCard: false,
    },
    {
      id: "4",
      title: "Gift Card $50",
      vendor: "Store",
      productType: "Gift Card",
      description: "Digital gift card for online purchases",
      handle: "gift-card-50",
      status: "active",
      priceRange: { min: 50, max: 50 },
      images: [],
      tags: ["gift", "digital"],
      createdAt: "2023-04-01",
      updatedAt: "2023-04-02",
      publishedAt: "2023-04-03",
      totalInventory: 100,
      hasOutOfStockVariants: false,
      isGiftCard: true,
    },
  ];

  let searchEngine: SearchEngine;

  beforeEach(() => {
    searchEngine = new SearchEngine(mockProducts);
  });

  describe("constructor", () => {
    it("should initialize with products", () => {
      expect(searchEngine).toBeInstanceOf(SearchEngine);
    });

    it("should handle empty products array", () => {
      const emptyEngine = new SearchEngine([]);
      const result = emptyEngine.search("test");
      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe("search", () => {
    it("should return all products when query is empty", () => {
      const result = searchEngine.search("");
      expect(result.products).toHaveLength(4);
      expect(result.total).toBe(4);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should search by title", () => {
      const result = searchEngine.search("iPhone");
      expect(result.products.length).toBeGreaterThanOrEqual(1);
      expect(result.products[0].title).toContain("iPhone");
    });

    it("should search by vendor", () => {
      const result = searchEngine.search("Apple");
      expect(result.products).toHaveLength(2);
      expect(result.products.every((p) => p.vendor === "Apple")).toBe(true);
    });

    it("should search by description", () => {
      const result = searchEngine.search("camera system");
      expect(result.products).toHaveLength(1);
      expect(result.products[0].description).toContain("camera system");
    });

    it("should search by product type", () => {
      const result = searchEngine.search("Smartphone");
      expect(result.products).toHaveLength(2);
      expect(result.products.every((p) => p.productType === "Smartphone")).toBe(
        true
      );
    });

    it("should search by tags", () => {
      const result = searchEngine.search("laptop");
      expect(result.products).toHaveLength(1);
      expect(result.products[0].tags).toContain("laptop");
    });

    it("should be case insensitive", () => {
      const result1 = searchEngine.search("apple");
      const result2 = searchEngine.search("APPLE");
      const result3 = searchEngine.search("Apple");

      expect(result1.total).toBe(result2.total);
      expect(result2.total).toBe(result3.total);
    });

    it("should handle partial matches", () => {
      const result = searchEngine.search("iPho");
      expect(result.products.length).toBeGreaterThanOrEqual(1);
      expect(result.products[0].title).toContain("iPhone");
    });
  });

  describe("pagination", () => {
    it("should paginate results correctly", () => {
      const result = searchEngine.search("", {}, 1, 2);
      expect(result.products).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
      expect(result.total).toBe(4);
    });

    it("should return second page correctly", () => {
      const result = searchEngine.search("", {}, 2, 2);
      expect(result.products).toHaveLength(2);
      expect(result.page).toBe(2);
      expect(result.products[0].id).toBe("3");
      expect(result.products[1].id).toBe("4");
    });

    it("should handle page beyond available results", () => {
      const result = searchEngine.search("", {}, 10, 2);
      expect(result.products).toHaveLength(0);
      expect(result.page).toBe(10);
      expect(result.total).toBe(4);
    });
  });

  describe("filters", () => {
    describe("vendor filter", () => {
      it("should filter by vendor", () => {
        const filters: SearchFilters = { vendor: "Apple" };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(2);
        expect(result.products.every((p) => p.vendor === "Apple")).toBe(true);
      });

      it("should filter by partial vendor name", () => {
        const filters: SearchFilters = { vendor: "App" };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(2);
        expect(result.products.every((p) => p.vendor.includes("App"))).toBe(
          true
        );
      });

      it("should be case insensitive", () => {
        const filters: SearchFilters = { vendor: "apple" };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(2);
      });
    });

    describe("product type filter", () => {
      it("should filter by product type", () => {
        const filters: SearchFilters = { productType: "Smartphone" };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(2);
        expect(
          result.products.every((p) => p.productType === "Smartphone")
        ).toBe(true);
      });

      it("should filter by partial product type", () => {
        const filters: SearchFilters = { productType: "Smart" };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(2);
      });
    });

    describe("price filters", () => {
      it("should filter by minimum price", () => {
        const filters: SearchFilters = { minPrice: 1000 };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(2); // iPhone and MacBook
        expect(
          result.products.every(
            (p) => (p.price || p.priceRange?.max || 0) >= 1000
          )
        ).toBe(true);
      });

      it("should filter by maximum price", () => {
        const filters: SearchFilters = { maxPrice: 800 };
        const result = searchEngine.search("", filters);

        expect(result.products.length).toBeGreaterThanOrEqual(1); // At least Gift Card
        expect(
          result.products.every(
            (p) => (p.price || p.priceRange?.min || 0) <= 800
          )
        ).toBe(true);
      });

      it("should filter by price range", () => {
        const filters: SearchFilters = { minPrice: 500, maxPrice: 1500 };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(2); // Samsung and iPhone
      });
    });

    describe("in stock filter", () => {
      it("should filter by in stock products", () => {
        const filters: SearchFilters = { inStock: true };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(3); // All except Samsung (out of stock)
        expect(
          result.products.every(
            (p) => (p.totalInventory || 0) > 0 && !p.hasOutOfStockVariants
          )
        ).toBe(true);
      });

      it("should not filter when inStock is false", () => {
        const filters: SearchFilters = { inStock: false };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(4); // All products
      });
    });

    describe("combined filters", () => {
      it("should apply multiple filters together", () => {
        const filters: SearchFilters = {
          vendor: "Apple",
          minPrice: 2000,
          inStock: true,
        };
        const result = searchEngine.search("", filters);

        expect(result.products).toHaveLength(1); // Only MacBook
        expect(result.products[0].title).toBe('MacBook Pro 16"');
      });
    });
  });

  describe("sorting", () => {
    it("should sort by price ascending", () => {
      const result = searchEngine.search("", {}, 1, 20, "price-asc");

      expect(result.products[0].priceRange.min).toBe(50); // Gift Card
      expect(result.products[1].priceRange.min).toBe(799); // Samsung
      expect(result.products[2].priceRange.min).toBe(999); // iPhone
      expect(result.products[3].priceRange.min).toBe(2499); // MacBook
    });

    it("should sort by price descending", () => {
      const result = searchEngine.search("", {}, 1, 20, "price-desc");

      expect(result.products[0].priceRange.max).toBe(3999); // MacBook
      expect(result.products[1].priceRange.max).toBe(1199); // iPhone
      expect(result.products[2].priceRange.max).toBe(999); // Samsung
      expect(result.products[3].priceRange.max).toBe(50); // Gift Card
    });

    it("should sort by name ascending", () => {
      const result = searchEngine.search("", {}, 1, 20, "name-asc");

      expect(result.products[0].title).toBe("Gift Card $50");
      expect(result.products[1].title).toBe("iPhone 14 Pro");
      expect(result.products[2].title).toBe('MacBook Pro 16"');
      expect(result.products[3].title).toBe("Samsung Galaxy S23");
    });

    it("should sort by name descending", () => {
      const result = searchEngine.search("", {}, 1, 20, "name-desc");

      expect(result.products[0].title).toBe("Samsung Galaxy S23");
      expect(result.products[1].title).toBe('MacBook Pro 16"');
      expect(result.products[2].title).toBe("iPhone 14 Pro");
      expect(result.products[3].title).toBe("Gift Card $50");
    });

    it("should sort by newest first", () => {
      const result = searchEngine.search("", {}, 1, 20, "newest");

      expect(result.products[0].createdAt).toBe("2023-04-01"); // Gift Card (newest)
      expect(result.products[3].createdAt).toBe("2023-01-01"); // iPhone (oldest)
    });

    it("should default to relevance sorting", () => {
      const result1 = searchEngine.search("Apple", {}, 1, 20, "relevance");
      const result2 = searchEngine.search("Apple", {}, 1, 20);

      expect(result1.products.map((p) => p.id)).toEqual(
        result2.products.map((p) => p.id)
      );
    });

    it("should handle products without prices in price sorting", () => {
      const productsWithoutPrice = [...mockProducts];
      productsWithoutPrice[0] = {
        ...productsWithoutPrice[0],
        priceRange: { min: 0, max: 0 },
      };

      const engine = new SearchEngine(productsWithoutPrice);
      const result = engine.search("", {}, 1, 20, "price-asc");

      // Products without prices should be at the end
      expect(result.products[result.products.length - 1].priceRange.min).toBe(
        0
      );
    });
  });

  describe("utility methods", () => {
    describe("getUniqueVendors", () => {
      it("should return unique vendors sorted alphabetically", () => {
        const vendors = searchEngine.getUniqueVendors();

        expect(vendors).toEqual(["Apple", "Samsung", "Store"]);
      });

      it("should filter out empty vendors", () => {
        const productsWithEmptyVendor = [
          ...mockProducts,
          {
            ...mockProducts[0],
            id: "5",
            vendor: "",
          },
        ];

        const engine = new SearchEngine(productsWithEmptyVendor);
        const vendors = engine.getUniqueVendors();

        expect(vendors).toEqual(["Apple", "Samsung", "Store"]);
      });
    });

    describe("getUniqueProductTypes", () => {
      it("should return unique product types sorted alphabetically", () => {
        const types = searchEngine.getUniqueProductTypes();

        expect(types).toEqual(["Gift Card", "Laptop", "Smartphone"]);
      });

      it("should filter out empty product types", () => {
        const productsWithEmptyType = [
          ...mockProducts,
          {
            ...mockProducts[0],
            id: "5",
            productType: "",
          },
        ];

        const engine = new SearchEngine(productsWithEmptyType);
        const types = engine.getUniqueProductTypes();

        expect(types).toEqual(["Gift Card", "Laptop", "Smartphone"]);
      });
    });

    describe("getPriceRange", () => {
      it("should return overall price range", () => {
        const priceRange = searchEngine.getPriceRange();

        expect(priceRange.min).toBe(50);
        expect(priceRange.max).toBe(3999);
      });

      it("should handle products without prices", () => {
        const productsWithoutPrice = [
          {
            ...mockProducts[0],
            priceRange: { min: 0, max: 0 },
          },
        ];

        const engine = new SearchEngine(productsWithoutPrice);
        const priceRange = engine.getPriceRange();

        expect(priceRange.min).toBe(0);
        expect(priceRange.max).toBe(0);
      });
    });

    describe("getSearchSuggestions", () => {
      it("should return relevant search suggestions", () => {
        const suggestions = searchEngine.getSearchSuggestions("iph");

        expect(suggestions).toContain("iPhone 14 Pro");
      });

      it("should limit suggestions to specified limit", () => {
        const suggestions = searchEngine.getSearchSuggestions("ap", 2);

        expect(suggestions.length).toBeLessThanOrEqual(2);
        expect(suggestions.length).toBeGreaterThanOrEqual(0);
      });

      it("should return empty array for empty query", () => {
        const suggestions = searchEngine.getSearchSuggestions("");

        expect(suggestions).toEqual([]);
      });
    });

    describe("updateProducts", () => {
      it("should update products and reinitialize search index", () => {
        const newProducts = [mockProducts[0]];
        searchEngine.updateProducts(newProducts);

        const result = searchEngine.search("");
        expect(result.products).toHaveLength(1);
      });
    });

    describe("getStats", () => {
      it("should return product statistics", () => {
        const stats = searchEngine.getStats();

        expect(stats.totalProducts).toBe(4);
        expect(stats.uniqueVendors).toBe(3);
        expect(stats.uniqueProductTypes).toBe(3);
        expect(stats.priceRange.min).toBe(50);
        expect(stats.priceRange.max).toBe(3999);
        expect(stats.avgPrice).toBeGreaterThan(0);
      });
    });
  });

  describe("performance", () => {
    it("should return processing time", () => {
      const result = searchEngine.search("test");

      expect(typeof result.processingTime).toBe("number");
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it("should handle large result sets efficiently", () => {
      const startTime = Date.now();
      const result = searchEngine.search("");
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
      expect(result.processingTime).toBeLessThan(100);
    });
  });
});
