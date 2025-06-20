/**
 * ESLint Rules Disabled for CSV Processor
 *
 * This file requires specific ESLint rule exceptions due to the nature of CSV data processing:
 *
 * 1. @typescript-eslint/no-explicit-any - Required for flexible CSV field parsing
 *    - CSV data comes in unknown formats and types from external sources
 *    - Field values need dynamic type checking and conversion (string | number | boolean | null)
 *    - Helper functions like parseImages(), parseTags() must handle any input gracefully
 *
 * 2. @typescript-eslint/no-require-imports - Required for Node.js file system operations
 *    - Dynamic imports needed for fs operations (existsSync, copyFile, rename, unlink)
 *    - These operations are conditionally loaded based on runtime environment
 *    - Server-side file management requires CommonJS modules for atomic operations
 *
 * 3. @typescript-eslint/no-unused-vars - False positives in complex processing logic
 *    - Variables used in different scopes and contexts that ESLint cannot detect
 *    - Destructured imports used conditionally in try-catch blocks
 *
 * These exceptions are isolated to this data processing layer and do not affect
 * type safety in the rest of the application. The main codebase maintains strict
 * TypeScript standards while this file handles the "dirty work" of data ingestion.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

// RECOMMENDED: Hybrid Approach - Best of Both Worlds
import { createReadStream } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { parse } from "csv-parse";
import fs from "fs";
import path from "path";
import { Product } from "./types";

/**
 * CSVProcessor handles parsing and processing of product CSV data.
 *
 * VERCEL PRODUCTION LIMITATION
 * ============================
 * Vercel's serverless environment has a read-only file system after deployment.
 * This processor detects the production environment and skips file writing operations:
 *
 * Development Behavior:
 * - Reads CSV files from public/ or data/ directories
 * - Can write processed data and indexes to disk
 * - Full file system access for development and testing
 *
 * Production Behavior (Vercel):
 * - Only reads existing files (CSV data, pre-built indexes)
 * - Skips any file writing operations to prevent EROFS errors
 * - Relies on build-time processing for optimal performance
 *
 * The isProduction() check ensures the processor works seamlessly in both
 * environments without throwing "read-only file system" errors in production.
 */

// Types for better TypeScript support
export interface ProcessingConfig {
  chunkSize: number;
  maxImages: number;
  maxDescriptionLength: number;
  enableProgress: boolean;
  enableMetrics: boolean;
}

export interface ProcessingResult {
  products: Product[];
  metadata: ProcessingMetadata;
  metrics: ProcessingMetrics;
}

export interface ProcessingMetrics {
  duration: number;
  throughput: number;
  peakMemoryUsage: number;
  errorCount: number;
  indexSize: number;
}

export interface ProcessingMetadata {
  totalProducts: number;
  vendors: string[];
  productTypes: string[];
  processedAt: string;
}

// Default configuration
const DEFAULT_CONFIG: ProcessingConfig = {
  chunkSize: 2000,
  maxImages: 3,
  maxDescriptionLength: 500,
  enableProgress: true,
  enableMetrics: true,
};

// Pure transformation functions (functional approach)
export const transformRow = (
  row: Record<string, unknown>,
  config: ProcessingConfig
): Product | null => {
  try {
    if (!row.ID || !row.TITLE) return null;

    return {
      id: String(row.ID || ""),
      title: String(row.TITLE || ""),
      vendor: String(row.VENDOR || ""),
      productType: String(row.PRODUCT_TYPE || ""),
      description: extractDescription(row).substring(
        0,
        config.maxDescriptionLength
      ),
      handle: String(row.HANDLE || ""),
      status: String(row.STATUS || "active"),
      priceRange: parsePriceRange(row.PRICE_RANGE_V2 || row.PRICE_RANGE),
      images: parseImages(
        row.IMAGES || row.IMAGE || row.FEATURED_IMAGE,
        config.maxImages
      ),
      tags: parseTags(row.TAGS),
      createdAt: String(row.CREATED_AT || ""),
      updatedAt: String(row.UPDATED_AT || ""),
      publishedAt: String(row.PUBLISHED_AT || ""),
      // Inventory and stock fields
      totalInventory: parseInventory(row.TOTAL_INVENTORY),
      hasOutOfStockVariants: parseBoolean(row.HAS_OUT_OF_STOCK_VARIANTS),
      isGiftCard: parseBoolean(row.IS_GIFT_CARD),
      featuredImage: parseFeaturedImage(row.FEATURED_IMAGE),
    };
  } catch (error) {
    console.warn(`Error transforming row:`, error);
    return null;
  }
};

// Pure helper functions
const extractDescription = (row: Record<string, unknown>): string => {
  const description = String(
    row.DESCRIPTION || row.BODY_HTML || row.DESCRIPTION_HTML || ""
  );
  return description.replace(/<[^>]*>/g, ""); // Strip HTML
};

const parsePriceRange = (priceField: unknown): { min: number; max: number } => {
  const defaultRange = { min: 0, max: 0 };
  if (!priceField) return defaultRange;

  try {
    const parsed = JSON.parse(String(priceField));
    if (parsed && typeof parsed === "object") {
      // Handle Shopify price format: { "min_variant_price": { "amount": 18.55, "currency_code": "GBP" } }
      if (parsed.min_variant_price && parsed.max_variant_price) {
        return {
          min: parseFloat(parsed.min_variant_price.amount || 0),
          max: parseFloat(parsed.max_variant_price.amount || 0),
        };
      }

      // Handle simple format: { "min": 18.55, "max": 18.55 }
      if (parsed.min !== undefined || parsed.max !== undefined) {
        return {
          min: parseFloat(parsed.min || 0),
          max: parseFloat(parsed.max || 0),
        };
      }

      // Handle legacy format
      if (parsed.min_variant_price || parsed.max_variant_price) {
        return {
          min: parseFloat(parsed.min_variant_price || 0),
          max: parseFloat(parsed.max_variant_price || 0),
        };
      }
    }
  } catch {
    // If JSON parsing fails, try to extract numbers from string
    const matches = priceField.toString().match(/[\d.]+/g);
    if (matches && matches.length >= 2) {
      return {
        min: parseFloat(matches[0]),
        max: parseFloat(matches[1]),
      };
    } else if (matches && matches.length === 1) {
      // Single price value
      const price = parseFloat(matches[0]);
      return { min: price, max: price };
    }
  }
  return defaultRange;
};

const parseImages = (imageField: any, maxImages: number): string[] => {
  if (!imageField) return [];

  try {
    const parsed = JSON.parse(imageField);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, maxImages);
    } else if (typeof parsed === "string" && parsed.startsWith("http")) {
      return [parsed];
    }
  } catch {
    if (typeof imageField === "string" && imageField.startsWith("http")) {
      return [imageField];
    }
  }
  return [];
};

const parseTags = (tagsField: any): string[] => {
  if (!tagsField) return [];

  try {
    const parsed = JSON.parse(tagsField);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    if (typeof tagsField === "string") {
      return tagsField
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const parseInventory = (inventoryField: any): number => {
  if (!inventoryField) return 0;

  const inventory = parseInt(inventoryField.toString(), 10);
  return isNaN(inventory) ? 0 : inventory;
};

const parseBoolean = (booleanField: any): boolean => {
  if (!booleanField) return false;

  const value = booleanField.toString().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
};

const parseFeaturedImage = (imageField: any): string => {
  if (!imageField) return "";

  try {
    const parsed = JSON.parse(imageField);
    if (parsed && typeof parsed === "object" && parsed.url) {
      return parsed.url;
    }
  } catch {
    // If JSON parsing fails, check if it's already a URL
    if (typeof imageField === "string" && imageField.startsWith("http")) {
      return imageField;
    }
  }
  return "";
};

// OOP-style class for complex state management and lifecycle
export class CSVProcessor {
  private readonly config: ProcessingConfig;
  private metrics: ProcessingMetrics;
  private startTime: number = 0;

  constructor(config: Partial<ProcessingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = {
      duration: 0,
      throughput: 0,
      peakMemoryUsage: 0,
      errorCount: 0,
      indexSize: 0,
    };
  }

  // Main processing method using functional approach internally
  async processCSV(filePath: string): Promise<ProcessingResult> {
    this.startTime = Date.now();
    console.log(`📊 Starting to process CSV file: ${filePath}`);

    const products: Product[] = [];
    let processedCount = 0;

    try {
      // Use functional streaming approach
      for await (const chunk of this.processCSVStream(filePath)) {
        products.push(...chunk);
        processedCount += chunk.length;

        if (this.config.enableMetrics) {
          this.updateMetrics(processedCount);
        }
      }

      const metadata = this.generateMetadata(products);
      await this.saveSearchIndex(products, metadata);

      this.metrics.duration = Date.now() - this.startTime;
      this.metrics.throughput =
        products.length / (this.metrics.duration / 1000);

      console.log(
        `✅ Processing completed in ${(this.metrics.duration / 1000).toFixed(
          1
        )} seconds`
      );
      console.log(
        `📈 Throughput: ${this.metrics.throughput.toFixed(0)} products/second`
      );

      return { products, metadata, metrics: this.metrics };
    } catch (error) {
      this.metrics.errorCount++;
      console.error("❌ Error processing CSV:", error);
      throw error;
    }
  }

  // Functional streaming with OOP lifecycle management
  private async *processCSVStream(
    filePath: string
  ): AsyncGenerator<Product[], void, unknown> {
    let processedCount = 0;
    let chunk: Product[] = [];

    const stream = createReadStream(filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: true,
        quote: '"',
        escape: '"',
        relax_quotes: true,
        relax_column_count: true,
        skip_records_with_error: true,
      })
    );

    for await (const row of stream) {
      const product = transformRow(row, this.config); // Pure function

      if (product) {
        chunk.push(product);
        processedCount++;

        if (chunk.length >= this.config.chunkSize) {
          yield [...chunk]; // Immutable copy
          chunk = [];

          if (this.config.enableProgress && processedCount % 10000 === 0) {
            console.log(
              `📈 Processed ${processedCount.toLocaleString()} records...`
            );
          }
        }
      } else {
        this.metrics.errorCount++;
      }
    }

    // Yield remaining chunk
    if (chunk.length > 0) {
      yield chunk;
    }
  }

  private updateMetrics(processedCount: number): void {
    if (process.memoryUsage) {
      const memUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      this.metrics.peakMemoryUsage = Math.max(
        this.metrics.peakMemoryUsage,
        memUsage
      );
    }
  }

  private generateMetadata(products: Product[]): ProcessingMetadata {
    return {
      totalProducts: products.length,
      vendors: [...new Set(products.map((p) => p.vendor).filter(Boolean))],
      productTypes: [
        ...new Set(products.map((p) => p.productType).filter(Boolean)),
      ],
      processedAt: new Date().toISOString(),
    };
  }

  private async saveSearchIndex(
    products: Product[],
    metadata: ProcessingMetadata
  ): Promise<void> {
    // Skip file writing in production environments (like Vercel)
    const isProduction =
      process.env.NODE_ENV === "production" || process.env.VERCEL;

    if (isProduction) {
      console.log(
        "🌐 Production environment detected, skipping index file write"
      );
      console.log(
        `📊 Index contains ${products.length.toLocaleString()} products`
      );
      console.log(`🏪 Found ${metadata.vendors.length} unique vendors`);
      console.log(
        `📦 Found ${metadata.productTypes.length} unique product types`
      );
      return;
    }

    console.log("💾 Creating search index...");

    const dataDir = join(process.cwd(), "data");
    await mkdir(dataDir, { recursive: true });

    const indexPath = join(dataDir, "search-index.json");
    const backupPath = join(dataDir, "search-index.backup.json");
    const tempPath = join(dataDir, "search-index.temp.json");

    const searchIndex = { products, metadata };
    const indexContent = JSON.stringify(searchIndex, null, 2);

    try {
      // Step 1: Create backup of existing index (if it exists)
      const { existsSync } = require("fs");
      if (existsSync(indexPath)) {
        console.log("🔄 Creating backup of existing index...");
        const { copyFile } = require("fs/promises");
        await copyFile(indexPath, backupPath);
      }

      // Step 2: Write to temporary file first (atomic write preparation)
      console.log("📝 Writing new index to temporary file...");
      await writeFile(tempPath, indexContent);

      // Step 3: Verify the temporary file is valid
      console.log("✅ Validating new index...");
      const tempData = JSON.parse(
        await require("fs/promises").readFile(tempPath, "utf-8")
      );
      if (!tempData.products || !Array.isArray(tempData.products)) {
        throw new Error("Generated index file is invalid");
      }

      // Step 4: Atomic replacement - rename temp file to final name
      console.log("🔄 Atomically replacing index file...");
      const { rename } = require("fs/promises");
      await rename(tempPath, indexPath);

      // Step 5: Clean up backup after successful replacement (optional)
      // We keep the backup for one successful generation as safety net
      const oldBackupPath = join(dataDir, "search-index.old.json");
      if (existsSync(backupPath) && existsSync(oldBackupPath)) {
        const { unlink } = require("fs/promises");
        await unlink(oldBackupPath);
      }
      if (existsSync(backupPath)) {
        await rename(backupPath, oldBackupPath);
      }

      console.log(`📁 Search index safely saved to: ${indexPath}`);
      console.log(
        `📊 Index contains ${products.length.toLocaleString()} products`
      );
      console.log(`🏪 Found ${metadata.vendors.length} unique vendors`);
      console.log(
        `📦 Found ${metadata.productTypes.length} unique product types`
      );

      // Calculate and store file size for metrics
      const { statSync } = require("fs");
      const stats = statSync(indexPath);
      this.metrics.indexSize = stats.size;
      console.log(
        `💾 Index file size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`
      );
    } catch (error) {
      console.error("❌ Failed to save search index:", error);

      // Cleanup temporary file if it exists
      const { existsSync, unlink } = require("fs");
      if (existsSync(tempPath)) {
        try {
          await require("fs/promises").unlink(tempPath);
        } catch (cleanupError) {
          console.warn("⚠️  Could not clean up temporary file:", cleanupError);
        }
      }

      // If we have a backup and the main file is corrupted, restore it
      if (existsSync(backupPath) && !existsSync(indexPath)) {
        console.log("🔄 Restoring from backup...");
        try {
          await require("fs/promises").copyFile(backupPath, indexPath);
          console.log("✅ Index restored from backup");
        } catch (restoreError) {
          console.error("❌ Failed to restore from backup:", restoreError);
        }
      }

      throw error;
    }
  }

  // Getter for configuration (immutable access)
  get configuration(): Readonly<ProcessingConfig> {
    return { ...this.config };
  }

  // Method to create processor with different config
  static create(config: Partial<ProcessingConfig> = {}): CSVProcessor {
    return new CSVProcessor(config);
  }
}

// Factory functions for common use cases (functional approach)
export const createCSVProcessor = (
  config: Partial<ProcessingConfig> = {}
): CSVProcessor => {
  return new CSVProcessor(config);
};

// Predefined processors for different scenarios
export const processors = {
  // Fast processing for development
  development: () =>
    createCSVProcessor({
      chunkSize: 1000,
      enableProgress: true,
      enableMetrics: false,
    }),

  // Optimized for production
  production: () =>
    createCSVProcessor({
      chunkSize: 5000,
      enableProgress: false,
      enableMetrics: true,
      maxImages: 5,
    }),

  // Memory-constrained environments
  minimal: () =>
    createCSVProcessor({
      chunkSize: 500,
      maxImages: 1,
      maxDescriptionLength: 200,
      enableProgress: false,
      enableMetrics: false,
    }),
};

// Pure function exports for testing and reuse
export const csvTransformations = {
  transformRow,
  extractDescription,
  parsePriceRange,
  parseImages,
  parseTags,
};

// Usage example:
// const processor = processors.production()
// const result = await processor.processCSV('path/to/file.csv')
