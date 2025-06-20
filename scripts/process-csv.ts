#!/usr/bin/env node

/**
 * Simple CSV processing script
 * This script processes CSV files using the hybrid processor
 */

import path from "path";

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
  console.log("🚀 Starting CSV processing with hybrid processor...");

  try {
    // Import the hybrid processor
    const { processors } = await import("../src/lib/csv-processor");

    // Use production-optimized processor
    const processor = processors.production();
    const csvPath = path.join(process.cwd(), "public", "products.csv");

    console.log(`📁 Processing file: ${csvPath}`);

    const result: ProcessResult = await processor.processCSV(csvPath);

    console.log("✅ CSV processing completed successfully!");
    console.log(
      `📊 Processed ${result.products.length.toLocaleString()} products`
    );
    console.log(
      `⚡ Performance: ${result.metrics.throughput.toFixed(0)} products/second`
    );
    console.log(
      `💾 Peak memory usage: ${result.metrics.peakMemoryUsage.toFixed(1)} MB`
    );
    console.log(`❌ Error count: ${result.metrics.errorCount}`);
    console.log("🔍 Search index has been created and saved.");
    console.log("🚀 You can now start the development server.");
  } catch (error) {
    console.error("❌ Error processing CSV:", error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
}
