import { NextRequest, NextResponse } from "next/server";
import { SearchEngine } from "@/lib/search-engine";
import { SearchFilters } from "@/lib/types";
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortByParam = searchParams.get("sortBy") || "relevance";
    const sortBy = [
      "relevance",
      "price-asc",
      "price-desc",
      "name-asc",
      "name-desc",
      "newest",
    ].includes(sortByParam)
      ? (sortByParam as
          | "relevance"
          | "price-asc"
          | "price-desc"
          | "name-asc"
          | "name-desc"
          | "newest")
      : "relevance";

    // Parse filters
    const filters: SearchFilters = {};

    if (searchParams.get("vendor")) {
      filters.vendor = searchParams.get("vendor")!;
    }

    if (searchParams.get("productType")) {
      filters.productType = searchParams.get("productType")!;
    }

    if (searchParams.get("minPrice")) {
      filters.minPrice = parseFloat(searchParams.get("minPrice")!);
    }

    if (searchParams.get("maxPrice")) {
      filters.maxPrice = parseFloat(searchParams.get("maxPrice")!);
    }

    if (searchParams.get("inStock") === "true") {
      filters.inStock = true;
    }

    // Initialize search engine if needed
    const engine = await initializeSearchEngine();

    // Perform search
    const results = engine.search(query, filters, page, limit, sortBy);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      filters = {},
      page = 1,
      limit = 20,
      sortBy = "relevance",
    } = body;

    // Initialize search engine if needed
    const engine = await initializeSearchEngine();

    // Perform search
    const results = engine.search(query, filters, page, limit, sortBy);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
