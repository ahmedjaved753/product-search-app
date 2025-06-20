#!/usr/bin/env node

/**
 * Development-time index check script
 * This script ensures the search index exists for development
 * Only generates if missing or outdated
 */

import path from "path";
import { existsSync, statSync, readFileSync } from "fs";
import { spawn } from "child_process";

interface ProcessResult {
  products: any[];
  metrics: {
    throughput: number;
    peakMemoryUsage: number;
    indexSize: number;
    errorCount: number;
  };
}

async function main(): Promise<void> {
  try {
    console.log("🚀 Preparing search index...");

    // Check command line arguments
    const forceRegenerate = process.argv.includes("--force");

    if (forceRegenerate) {
      console.log("🔄 Force regeneration requested");
    }

    // Set up paths
    const projectRoot = process.cwd();
    const csvPath = path.join(projectRoot, "public", "products.csv");
    const indexPath = path.join(projectRoot, "data", "search-index.json");

    // Check if CSV exists
    if (!existsSync(csvPath)) {
      console.error("❌ CSV file not found:", csvPath);
      process.exit(1);
    }

    // Check if we need to regenerate
    let shouldRegenerate = forceRegenerate;

    if (!shouldRegenerate && existsSync(indexPath)) {
      const csvStats = statSync(csvPath);
      const indexStats = statSync(indexPath);

      // If CSV is newer than index, regenerate
      if (csvStats.mtime > indexStats.mtime) {
        console.log("📝 CSV file is newer than index, will regenerate");
        shouldRegenerate = true;
      }

      // If index is older than 24 hours, regenerate
      const indexAge = Date.now() - indexStats.mtime.getTime();
      const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours

      if (indexAge > maxAgeMs) {
        console.log("📝 Index is older than 24 hours, will regenerate");
        shouldRegenerate = true;
      }

      // Check if index file is empty or corrupted
      const indexSize = indexStats.size;
      if (indexSize < 1000) {
        // Less than 1KB is probably empty/corrupted
        console.log("📝 Index file appears corrupted, will regenerate");
        shouldRegenerate = true;
      }
    } else if (!existsSync(indexPath)) {
      console.log("📝 Search index not found, will generate");
      shouldRegenerate = true;
    }

    if (shouldRegenerate) {
      console.log("🔄 Regenerating search index...");

      try {
        // Import the TypeScript processor directly
        const { processors } = await import("../src/lib/csv-processor");

        const startTime = Date.now();

        // Use production processor
        const processor = processors.production();
        const result: ProcessResult = await processor.processCSV(csvPath);

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
      } catch (tsError) {
        // Fallback: use the existing process-csv-hybrid.js script
        console.log("📝 Using fallback CSV processing script...");

        const child = spawn("node", ["scripts/process-csv-hybrid.js"], {
          stdio: "inherit",
          cwd: projectRoot,
        });

        await new Promise<void>((resolve, reject) => {
          child.on("close", (code) => {
            if (code === 0) {
              console.log("✅ Index generation completed via fallback script");
              resolve();
            } else {
              reject(new Error(`Fallback script failed with code ${code}`));
            }
          });

          child.on("error", reject);
        });
      }
    } else {
      console.log("✅ Using existing search index");

      // Load and show info about existing index
      try {
        const data = readFileSync(indexPath, "utf-8");
        const indexData = JSON.parse(data);

        const productCount = Array.isArray(indexData)
          ? indexData.length
          : indexData.products?.length || 0;

        console.log(
          `📊 Search index ready: ${productCount.toLocaleString()} products`
        );

        // Show index file info
        const stats = statSync(indexPath);
        console.log(`📅 Index created: ${stats.mtime.toLocaleString()}`);
        console.log(
          `💾 Index size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.warn("⚠️  Could not read index file info:", errorMessage);
      }
    }

    console.log("🎉 Search index preparation complete!");
  } catch (error) {
    console.error("❌ Failed to prepare search index:", error);
    console.log("\n💡 Troubleshooting:");
    console.log('1. Make sure you have run "npm install"');
    console.log("2. Ensure the CSV file exists in public/products.csv");
    console.log('3. Try running "npm run force-rebuild-index"');
    console.log("4. Check if the data directory exists and is writable");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⚠️  Index preparation interrupted");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  Index preparation terminated");
  process.exit(0);
});

// Run the script
main().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
