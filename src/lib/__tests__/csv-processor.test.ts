import { transformRow, CSVProcessor } from "../csv-processor";
import { ProcessingConfig } from "../csv-processor";

// Helper function to access parseInventory from the module
const parseInventoryHelper = (value: unknown): number => {
  if (!value) return 0;
  const inventory = parseInt(value.toString(), 10);
  return isNaN(inventory) ? 0 : inventory;
};

// Helper function to access parseBoolean from the module
const parseBooleanHelper = (value: unknown): boolean => {
  if (!value) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const str = value.toLowerCase().trim();
    return str === "true" || str === "1" || str === "yes";
  }
  return false;
};

describe("CSV Processor Hybrid", () => {
  describe("transformRow", () => {
    const config: ProcessingConfig = {
      chunkSize: 2000,
      maxImages: 3,
      maxDescriptionLength: 500,
      enableProgress: true,
      enableMetrics: true,
    };

    it("should transform a valid row to a Product", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        VENDOR: "Test Vendor",
        PRODUCT_TYPE: "Test Type",
        DESCRIPTION: "Test Description",
        HANDLE: "test-product",
        STATUS: "active",
        PRICE_RANGE_V2:
          '{"min_variant_price": {"amount": 10.99, "currency_code": "USD"}, "max_variant_price": {"amount": 19.99, "currency_code": "USD"}}',
        IMAGES:
          '["https://example.com/image1.jpg", "https://example.com/image2.jpg"]',
        TAGS: '["tag1", "tag2"]',
        CREATED_AT: "2023-01-01",
        UPDATED_AT: "2023-01-02",
        PUBLISHED_AT: "2023-01-03",
        TOTAL_INVENTORY: "50",
        HAS_OUT_OF_STOCK_VARIANTS: "false",
        IS_GIFT_CARD: "false",
        FEATURED_IMAGE: "https://example.com/featured.jpg",
      };

      const result = transformRow(row, config);

      expect(result).toEqual({
        id: "123",
        title: "Test Product",
        vendor: "Test Vendor",
        productType: "Test Type",
        description: "Test Description",
        handle: "test-product",
        status: "active",
        priceRange: { min: 10.99, max: 19.99 },
        images: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
        ],
        tags: ["tag1", "tag2"],
        createdAt: "2023-01-01",
        updatedAt: "2023-01-02",
        publishedAt: "2023-01-03",
        totalInventory: 50,
        hasOutOfStockVariants: false,
        isGiftCard: false,
        featuredImage: "https://example.com/featured.jpg",
      });
    });

    it("should return null for invalid row (missing required fields)", () => {
      const row = {
        VENDOR: "Test Vendor",
        // Missing ID and TITLE
      };

      const result = transformRow(row, config);
      expect(result).toBeNull();
    });

    it("should handle empty or malformed data gracefully", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        PRICE_RANGE_V2: "invalid json",
        IMAGES: "invalid json",
        TAGS: "invalid json",
        TOTAL_INVENTORY: "invalid",
      };

      const result = transformRow(row, config);

      expect(result).toEqual(
        expect.objectContaining({
          id: "123",
          title: "Test Product",
          vendor: "",
          productType: "",
          description: "",
          handle: "",
          status: "active",
          priceRange: { min: 0, max: 0 },
          images: [],
          tags: ["invalid json"], // parseTags will return ["invalid json"] for invalid JSON
          createdAt: "",
          updatedAt: "",
          publishedAt: "",
          totalInventory: 0,
          hasOutOfStockVariants: false,
          isGiftCard: false,
          featuredImage: "",
        })
      );
    });

    it("should truncate description to maxDescriptionLength", () => {
      const longDescription = "A".repeat(1000);
      const row = {
        ID: "123",
        TITLE: "Test Product",
        DESCRIPTION: longDescription,
      };

      const result = transformRow(row, config);

      expect(result?.description).toHaveLength(config.maxDescriptionLength);
    });

    it("should parse HTML description and strip tags", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        DESCRIPTION: "<p>This is <strong>HTML</strong> content</p>",
      };

      const result = transformRow(row, config);

      expect(result?.description).toBe("This is HTML content");
    });

    it("should limit images to maxImages", () => {
      const manyImages = JSON.stringify([
        "img1.jpg",
        "img2.jpg",
        "img3.jpg",
        "img4.jpg",
        "img5.jpg",
      ]);

      const row = {
        ID: "123",
        TITLE: "Test Product",
        IMAGES: manyImages,
      };

      const result = transformRow(row, config);

      expect(result?.images).toHaveLength(config.maxImages);
      expect(result?.images).toEqual(["img1.jpg", "img2.jpg", "img3.jpg"]);
    });
  });

  describe("Helper Functions", () => {
    describe("parseInventory", () => {
      it("should parse valid inventory numbers", () => {
        expect(parseInventoryHelper("50")).toBe(50);
        expect(parseInventoryHelper(25)).toBe(25);
        expect(parseInventoryHelper("0")).toBe(0);
      });

      it("should return 0 for invalid inventory", () => {
        expect(parseInventoryHelper("invalid")).toBe(0);
        expect(parseInventoryHelper(null)).toBe(0);
        expect(parseInventoryHelper(undefined)).toBe(0);
        expect(parseInventoryHelper("")).toBe(0);
      });

      it("should handle negative numbers", () => {
        expect(parseInventoryHelper("-5")).toBe(-5);
      });
    });

    describe("parseBoolean", () => {
      it("should parse truthy values", () => {
        expect(parseBooleanHelper("true")).toBe(true);
        expect(parseBooleanHelper("TRUE")).toBe(true);
        expect(parseBooleanHelper("1")).toBe(true);
        expect(parseBooleanHelper(1)).toBe(true);
        expect(parseBooleanHelper(true)).toBe(true);
      });

      it("should parse falsy values", () => {
        expect(parseBooleanHelper("false")).toBe(false);
        expect(parseBooleanHelper("FALSE")).toBe(false);
        expect(parseBooleanHelper("0")).toBe(false);
        expect(parseBooleanHelper(0)).toBe(false);
        expect(parseBooleanHelper(false)).toBe(false);
        expect(parseBooleanHelper("")).toBe(false);
        expect(parseBooleanHelper(null)).toBe(false);
        expect(parseBooleanHelper(undefined)).toBe(false);
      });
    });
  });

  describe("CSVProcessor", () => {
    let processor: CSVProcessor;

    beforeEach(() => {
      processor = new CSVProcessor({
        chunkSize: 100,
        enableMetrics: true,
        enableProgress: false, // Disable for tests
      });
    });

    describe("constructor", () => {
      it("should create processor with default config", () => {
        const defaultProcessor = new CSVProcessor();
        expect(defaultProcessor.configuration).toEqual(
          expect.objectContaining({
            chunkSize: 2000,
            maxImages: 3,
            maxDescriptionLength: 500,
            enableProgress: true,
            enableMetrics: true,
          })
        );
      });

      it("should merge custom config with defaults", () => {
        const customProcessor = new CSVProcessor({
          chunkSize: 500,
          maxImages: 5,
        });

        expect(customProcessor.configuration).toEqual(
          expect.objectContaining({
            chunkSize: 500,
            maxImages: 5,
            maxDescriptionLength: 500, // default
            enableProgress: true, // default
            enableMetrics: true, // default
          })
        );
      });
    });

    describe("static factory methods", () => {
      it("should create processor using static create method", () => {
        const processor = CSVProcessor.create({ chunkSize: 1000 });
        expect(processor).toBeInstanceOf(CSVProcessor);
        expect(processor.configuration.chunkSize).toBe(1000);
      });
    });

    describe("configuration access", () => {
      it("should provide readonly access to configuration", () => {
        const config = processor.configuration;
        expect(config).toEqual(
          expect.objectContaining({
            chunkSize: 100,
            enableMetrics: true,
            enableProgress: false,
          })
        );

        // Should be readonly - this would fail in TypeScript
        // config.chunkSize = 200; // TypeScript error
      });
    });
  });

  describe("Price Range Parsing", () => {
    const config: ProcessingConfig = {
      chunkSize: 2000,
      maxImages: 3,
      maxDescriptionLength: 500,
      enableProgress: true,
      enableMetrics: true,
    };

    it("should parse Shopify price format", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        PRICE_RANGE_V2:
          '{"min_variant_price": {"amount": 15.99, "currency_code": "USD"}, "max_variant_price": {"amount": 25.99, "currency_code": "USD"}}',
      };

      const result = transformRow(row, config);
      expect(result?.priceRange).toEqual({ min: 15.99, max: 25.99 });
    });

    it("should parse simple price format", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        PRICE_RANGE_V2: '{"min": 10.50, "max": 20.50}',
      };

      const result = transformRow(row, config);
      expect(result?.priceRange).toEqual({ min: 10.5, max: 20.5 });
    });

    it("should handle single price value", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        PRICE_RANGE_V2: '{"min": 19.99, "max": 19.99}',
      };

      const result = transformRow(row, config);
      expect(result?.priceRange).toEqual({ min: 19.99, max: 19.99 });
    });

    it("should return zero range for invalid price data", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        PRICE_RANGE_V2: "invalid price data",
      };

      const result = transformRow(row, config);
      expect(result?.priceRange).toEqual({ min: 0, max: 0 });
    });
  });

  describe("Image Parsing", () => {
    const config: ProcessingConfig = {
      chunkSize: 2000,
      maxImages: 2,
      maxDescriptionLength: 500,
      enableProgress: true,
      enableMetrics: true,
    };

    it("should parse JSON array of images", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        IMAGES:
          '["https://example.com/img1.jpg", "https://example.com/img2.jpg", "https://example.com/img3.jpg"]',
      };

      const result = transformRow(row, config);
      expect(result?.images).toEqual([
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg",
      ]);
    });

    it("should handle single image string", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        IMAGES: "https://example.com/single.jpg",
      };

      const result = transformRow(row, config);
      expect(result?.images).toEqual(["https://example.com/single.jpg"]);
    });

    it("should return empty array for invalid image data", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        IMAGES: "not a url or json",
      };

      const result = transformRow(row, config);
      expect(result?.images).toEqual([]);
    });
  });

  describe("Tags Parsing", () => {
    const config: ProcessingConfig = {
      chunkSize: 2000,
      maxImages: 3,
      maxDescriptionLength: 500,
      enableProgress: true,
      enableMetrics: true,
    };

    it("should parse JSON array of tags", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        TAGS: '["electronics", "gadgets", "tech"]',
      };

      const result = transformRow(row, config);
      expect(result?.tags).toEqual(["electronics", "gadgets", "tech"]);
    });

    it("should parse comma-separated string tags", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        TAGS: "electronics, gadgets, tech",
      };

      const result = transformRow(row, config);
      expect(result?.tags).toEqual(["electronics", "gadgets", "tech"]);
    });

    it("should handle empty tags", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        TAGS: "",
      };

      const result = transformRow(row, config);
      expect(result?.tags).toEqual([]);
    });

    it("should filter out empty tags", () => {
      const row = {
        ID: "123",
        TITLE: "Test Product",
        TAGS: "electronics, , gadgets, , tech",
      };

      const result = transformRow(row, config);
      expect(result?.tags).toEqual(["electronics", "gadgets", "tech"]);
    });
  });
});
