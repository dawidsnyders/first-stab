import { NextRequest, NextResponse } from "next/server";
import { scrapeProperty24 } from "@/lib/scrapers/property24";
import { scrapeMunicipalValuations } from "@/lib/scrapers/municipal";

/**
 * API endpoint for triggering data scraping
 *
 * POST /api/scrape
 * Body: { areaName: string, source: 'property24' | 'municipal' | 'both' }
 *
 * This endpoint can be called:
 * - Manually via admin interface
 * - Scheduled via cron job
 * - Triggered after payment for report generation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { areaName, source = "both" } = body;

    if (!areaName) {
      return NextResponse.json(
        { error: "Missing required field: areaName" },
        { status: 400 }
      );
    }

    const results: any = { areaName, scrapedAt: new Date().toISOString() };

    if (source === "property24" || source === "both") {
      results.property24 = await scrapeProperty24(areaName);
    }

    if (source === "municipal" || source === "both") {
      results.municipal = await scrapeMunicipalValuations(areaName);
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check scraper status
export async function GET() {
  return NextResponse.json({
    status: "operational",
    scrapers: {
      property24: "ready",
      municipal: "ready",
    },
    note: "Scrapers are in placeholder mode. Implement actual scraping logic for production.",
  });
}
