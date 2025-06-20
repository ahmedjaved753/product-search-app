import { existsSync, statSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { processors } from "./csv-processor";
import { Product } from "./types";

interface StartupConfig {
  forceRegenerate?: boolean;
  csvPath?: string;
  indexPath?: string;
  maxAgeHours?: number;
}

export class StartupProcessor {
  private csvPath: string;
  private indexPath: string;
  private maxAgeHours: number;

  constructor(config: StartupConfig = {}) {
    this.csvPath =
      config.csvPath || path.join(process.cwd(), "public", "products.csv");
    this.indexPath =
      config.indexPath || path.join(process.cwd(), "data", "search-index.json");
    this.maxAgeHours = config.maxAgeHours || 24; // Regenerate if index is older than 24 hours
  }

  /**
   * Main startup method - ensures search index is ready
   */
  async ensureSearchIndex(forceRegenerate = false): Promise<Product[]> {
    console.log("🚀 Starting search index initialization...");

    try {
      // Check if we need to regenerate the index
      const shouldRegenerate = forceRegenerate || this.shouldRegenerateIndex();

      if (shouldRegenerate) {
        console.log("🔄 Regenerating search index...");
        await this.generateIndex();
      } else {
        console.log("✅ Using existing search index");
      }

      // Load and return the index
      const products = await this.loadIndex();
      console.log(
        `📊 Search index ready: ${products.length.toLocaleString()} products`
      );

      return products;
    } catch (error) {
      console.error("❌ Failed to initialize search index:", error);
      throw error;
    }
  }

  /**
   * Check if index needs regeneration
   */
  private shouldRegenerateIndex(): boolean {
    // Check if CSV file exists
    if (!existsSync(this.csvPath)) {
      console.warn(`⚠️  CSV file not found: ${this.csvPath}`);
      return false;
    }

    // Check if index file exists
    if (!existsSync(this.indexPath)) {
      console.log("📝 Search index not found, will generate");
      return true;
    }

    try {
      // Check file ages
      const csvStats = statSync(this.csvPath);
      const indexStats = statSync(this.indexPath);

      // If CSV is newer than index, regenerate
      if (csvStats.mtime > indexStats.mtime) {
        console.log("📝 CSV file is newer than index, will regenerate");
        return true;
      }

      // If index is older than maxAgeHours, regenerate
      const indexAge = Date.now() - indexStats.mtime.getTime();
      const maxAgeMs = this.maxAgeHours * 60 * 60 * 1000;

      if (indexAge > maxAgeMs) {
        console.log(
          `📝 Index is older than ${this.maxAgeHours} hours, will regenerate`
        );
        return true;
      }

      // Check if index file is empty or corrupted
      const indexSize = indexStats.size;
      if (indexSize < 1000) {
        // Less than 1KB is probably empty/corrupted
        console.log("📝 Index file appears corrupted, will regenerate");
        return true;
      }

      return false;
    } catch (error) {
      console.warn("⚠️  Error checking file stats, will regenerate:", error);
      return true;
    }
  }

  /**
   * Generate new search index from CSV
   */
  private async generateIndex(): Promise<void> {
    console.log(`📁 Processing CSV file: ${this.csvPath}`);

    const startTime = Date.now();

    try {
      // Use production processor for optimal performance
      const processor = processors.production();
      const result = await processor.processCSV(this.csvPath);

      const duration = Date.now() - startTime;

      console.log("✅ Index generation completed successfully!");
      console.log(
        `📊 Processed ${result.products.length.toLocaleString()} products`
      );
      console.log(
        `⚡ Performance: ${result.metrics.throughput.toFixed(
          0
        )} products/second`
      );
      console.log(`⏱️  Total time: ${(duration / 1000).toFixed(1)} seconds`);
      console.log(
        `💾 Peak memory: ${result.metrics.peakMemoryUsage.toFixed(1)} MB`
      );

      if (result.metrics.errorCount > 0) {
        console.warn(
          `⚠️  Skipped ${result.metrics.errorCount} invalid records`
        );
      }
    } catch (error) {
      console.error("❌ Failed to generate search index:", error);
      throw error;
    }
  }

  /**
   * Load existing search index
   */
  private async loadIndex(): Promise<Product[]> {
    try {
      const data = await readFile(this.indexPath, "utf-8");
      const indexData = JSON.parse(data);

      // Handle both formats: direct array or object with products property
      if (Array.isArray(indexData)) {
        return indexData;
      } else if (indexData.products && Array.isArray(indexData.products)) {
        return indexData.products;
      } else {
        throw new Error("Invalid search index format");
      }
    } catch (error) {
      console.error("❌ Failed to load search index:", error);
      throw error;
    }
  }

  /**
   * Get index file information
   */
  async getIndexInfo() {
    if (!existsSync(this.indexPath)) {
      return { exists: false };
    }

    try {
      const stats = statSync(this.indexPath);
      const data = await readFile(this.indexPath, "utf-8");
      const indexData = JSON.parse(data);

      const productCount = Array.isArray(indexData)
        ? indexData.length
        : indexData.products?.length || 0;

      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        productCount,
        metadata: indexData.metadata || null,
      };
    } catch (error) {
      return {
        exists: true,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

/**
 * Factory function for easy usage
 */
export const createStartupProcessor = (config?: StartupConfig) => {
  return new StartupProcessor(config);
};

/**
 * Quick initialization function for common use cases
 */
export const initializeSearchIndex = async (
  forceRegenerate = false
): Promise<Product[]> => {
  const processor = createStartupProcessor();
  return processor.ensureSearchIndex(forceRegenerate);
};
