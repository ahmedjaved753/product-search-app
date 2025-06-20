import { NextResponse } from "next/server";
import { SearchEngine } from "@/lib/search-engine";
import { initializeSearchIndex } from "@/lib/startup-processor";

let searchEngine: SearchEngine | null = null;
let isInitialized = false;

async function initializeSearchEngine() {
  if (isInitialized && searchEngine) {
    return searchEngine;
  }

  try {
    // Use startup processor to ensure index is ready
    const products = await initializeSearchIndex();

    searchEngine = new SearchEngine(products);
    isInitialized = true;

    console.log(
      `✅ Search engine initialized with ${products.length.toLocaleString()} products`
    );
    return searchEngine;
  } catch (error) {
    console.error("❌ Failed to initialize search engine:", error);
    throw error;
  }
}

export async function GET() {
  try {
    // Initialize search engine if needed
    const engine = await initializeSearchEngine();

    // Get metadata from search engine
    const vendors = engine.getUniqueVendors();
    const productTypes = engine.getUniqueProductTypes();
    const priceRange = engine.getPriceRange();
    const stats = engine.getStats();

    const metadata = {
      vendors,
      productTypes,
      priceRange,
      stats,
    };

    return NextResponse.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error("Metadata API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get metadata",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
