"use server";

import { SearchEngine } from "@/lib/search-engine";
import { initializeSearchIndex } from "@/lib/startup-processor";

/**
 * Server Action: Get metadata for search filters
 * Uses search engine directly to avoid circular dependencies
 */
export async function getSearchMetadata() {
  try {
    // Initialize search index and create engine
    const products = await initializeSearchIndex();
    const engine = new SearchEngine(products);

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

    return {
      success: true,
      data: metadata,
    };
  } catch (error) {
    console.error("Server Action - Metadata error:", error);
    return {
      success: false,
      error: "Failed to get metadata",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
