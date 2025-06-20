#!/usr/bin/env node

/**
 * Development-time index check script
 * This script ensures the search index exists for development
 * Only generates if missing - optimized for fast dev startup
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
    console.log("🔍 Checking search index for development...");

    // Set up paths
    const projectRoot = process.cwd();
    const csvPath = path.join(projectRoot, "public", "products.csv");
    const indexPath = path.join(projectRoot, "data", "search-index.json");

    // Check if CSV exists
    if (!existsSync(csvPath)) {
      console.warn("⚠️  CSV file not found:", csvPath);
      console.log("💡 Development will use empty dataset");
      return;
    }

    // Check if index exists and is valid
    let needsGeneration = false;

    if (!existsSync(indexPath)) {
      console.log("📝 Search index not found, will generate for development");
      needsGeneration = true;
    } else {
      try {
        // Quick validation of existing index
        const data = readFileSync(indexPath, "utf-8");
        const indexData = JSON.parse(data);

        const productCount = Array.isArray(indexData)
          ? indexData.length
          : indexData.products?.length || 0;

        if (productCount === 0) {
          console.log("📝 Index appears empty, will regenerate");
          needsGeneration = true;
        } else {
          console.log(
            `✅ Development index ready: ${productCount.toLocaleString()} products`
          );

          // Show quick stats
          const stats = statSync(indexPath);
          const indexAge = Date.now() - stats.mtime.getTime();
          const ageHours = Math.floor(indexAge / (1000 * 60 * 60));

          if (ageHours > 0) {
            console.log(`📅 Index age: ${ageHours} hours old`);
            if (ageHours > 48) {
              console.log(
                '💡 Consider running "npm run force-rebuild-index" for fresh data'
              );
            }
          }
        }
      } catch (error) {
        console.log("📝 Index file corrupted, will regenerate");
        needsGeneration = true;
      }
    }

    if (needsGeneration) {
      console.log("🔄 Generating index for development...");

      try {
        // Import the TypeScript processor directly
        const { processors } = await import("../src/lib/csv-processor");

        const startTime = Date.now();

        // Use production processor but with less verbose output
        const processor = processors.production();
        const result: ProcessResult = await processor.processCSV(csvPath);

        const duration = Date.now() - startTime;

        console.log("✅ Development index generated!");
        console.log(
          `📊 ${result.products.length.toLocaleString()} products indexed in ${(
            duration / 1000
          ).toFixed(1)}s`
        );
      } catch (tsError) {
        // Fallback: use the existing process-csv-hybrid.js script
        console.log("📝 Using fallback processing...");

        const child = spawn("node", ["scripts/process-csv-hybrid.js"], {
          stdio: "pipe", // Capture output to reduce noise
          cwd: projectRoot,
        });

        let output = "";
        child.stdout?.on("data", (data) => {
          output += data.toString();
        });

        await new Promise<void>((resolve, reject) => {
          child.on("close", (code) => {
            if (code === 0) {
              console.log("✅ Development index generated via fallback");
              // Show just the key info from output
              const lines = output.split("\n");
              const productLine = lines.find((line) =>
                line.includes("products indexed")
              );
              if (productLine) {
                console.log(
                  productLine.replace(/.*?(\d+.*products indexed.*)/, "📊 $1")
                );
              }
              resolve();
            } else {
              reject(new Error(`Fallback script failed with code ${code}`));
            }
          });

          child.on("error", reject);
        });
      }
    }

    console.log("🚀 Development environment ready!");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.warn("⚠️  Could not ensure search index:", errorMessage);
    console.log("💡 Development will continue with runtime index generation");
    console.log("   (First search request may be slower)");

    // Don't fail dev startup - just warn
    // The startup processor will handle it at runtime
  }
}

// Handle graceful shutdown (don't fail dev startup)
process.on("SIGINT", () => {
  console.log("\n⚠️  Index check interrupted");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  Index check terminated");
  process.exit(0);
});

// Run the script
main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.warn("⚠️  Index check failed:", errorMessage);
  console.log("💡 Development will continue with runtime generation");
  process.exit(0); // Don't fail dev startup
});
