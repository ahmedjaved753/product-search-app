"use server";

import { getSearchMetadata as getMetadataFromService } from "@/services";

/**
 * Server Action: Get metadata for search filters
 * Now uses the service layer for consistency
 */
export async function getSearchMetadata() {
  try {
    const metadata = await getMetadataFromService();
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
