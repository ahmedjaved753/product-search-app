import { NextRequest, NextResponse } from "next/server";
import { SearchEngine } from "@/lib/search-engine";
import { initializeSearchIndex } from "@/lib/startup-processor";

let searchEngine: SearchEngine | null = null;

async function getSearchEngine() {
  if (searchEngine) {
    return searchEngine;
  }

  try {
    // Use startup processor to ensure index is ready
    const products = await initializeSearchIndex();

    searchEngine = new SearchEngine(products);
    return searchEngine;
  } catch (error) {
    console.error("Failed to initialize search engine:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const engine = await getSearchEngine();
    const suggestions = engine.getSearchSuggestions(query, limit);

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get suggestions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
