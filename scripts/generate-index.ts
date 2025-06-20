#!/usr/bin/env node

/**
 * Build-time index generation script
 * This script generates the search index during the build process
 * Always regenerates to ensure fresh data for production deployments
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
    console.log("🏗️  Build-time index generation...");

    // Check command line arguments
    const forceRegenerate = process.argv.includes("--force");

    // Set up paths
    const projectRoot = process.cwd();
    const csvPath = path.join(projectRoot, "public", "products.csv");
    const indexPath = path.join(projectRoot, "data", "search-index.json");

    // Check if CSV exists
    if (!existsSync(csvPath)) {
      console.error("❌ CSV file not found:", csvPath);
      console.log("💡 Make sure products.csv exists in the public/ directory");
      process.exit(1);
    }

    // Show CSV file info
    const csvStats = statSync(csvPath);
    console.log(`📁 CSV file: ${(csvStats.size / 1024 / 1024).toFixed(1)} MB`);
    console.log(`📅 CSV modified: ${csvStats.mtime.toLocaleString()}`);

    // Always generate during build (unless we want to optimize for existing fresh index)
    let shouldGenerate = true;

    if (!forceRegenerate && existsSync(indexPath)) {
      const indexStats = statSync(indexPath);

      // Only skip if index is newer than CSV and was created recently (within last hour)
      const indexAge = Date.now() - indexStats.mtime.getTime();
      const isRecent = indexAge < 60 * 60 * 1000; // 1 hour
      const isNewer = indexStats.mtime > csvStats.mtime;

      if (isRecent && isNewer) {
        console.log("⚡ Recent index found, skipping generation");
        shouldGenerate = false;
      }
    }

    if (shouldGenerate) {
      console.log("🔄 Generating search index for production...");

      // Use the hybrid processor
      try {
        // Import the TypeScript processor directly
        const { processors } = await import("../src/lib/csv-processor");

        const startTime = Date.now();

        // Use production processor for optimal performance
        const processor = processors.production();
        const result: ProcessResult = await processor.processCSV(csvPath);

        const duration = Date.now() - startTime;

        console.log("✅ Build-time index generation completed!");
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
        console.log(
          `📦 Index size: ${(result.metrics.indexSize / 1024 / 1024).toFixed(
            1
          )} MB`
        );

        if (result.metrics.errorCount > 0) {
          console.warn(
            `⚠️  Skipped ${result.metrics.errorCount} invalid records`
          );
        }

        // Show build optimization info
        console.log("\n🚀 Production Optimization:");
        console.log("• Index pre-generated at build time");
        console.log("• Zero server startup latency");
        console.log("• Immediate search response for first user");
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
      // Show existing index info
      try {
        const data = readFileSync(indexPath, "utf-8");
        const indexData = JSON.parse(data);

        const productCount = Array.isArray(indexData)
          ? indexData.length
          : indexData.products?.length || 0;

        console.log(
          `📊 Using existing index: ${productCount.toLocaleString()} products`
        );

        const stats = statSync(indexPath);
        console.log(
          `💾 Index size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`
        );
      } catch (error) {
        console.warn("⚠️  Could not read existing index, will regenerate");
        // Retry with generation
        process.argv.push("--force");
        return main();
      }
    }

    console.log("🎉 Build-time index preparation complete!");
    console.log("🚀 Ready for production deployment with zero startup latency");
  } catch (error) {
    console.error("❌ Build-time index generation failed:", error);
    console.log("\n💡 Troubleshooting:");
    console.log("1. Ensure CSV file exists in public/products.csv");
    console.log("2. Check available memory (processing requires ~100MB)");
    console.log("3. Verify data directory is writable");
    console.log("4. Try: npm run force-rebuild-index");

    // Fail the build if we can't generate the index
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⚠️  Build-time index generation interrupted");
  process.exit(1); // Fail the build
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  Build-time index generation terminated");
  process.exit(1); // Fail the build
});

// Run the script
main().catch((error) => {
  console.error("❌ Unhandled error during build:", error);
  process.exit(1);
});
