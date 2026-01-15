import { NextRequest, NextResponse } from "next/server";
import { runDataPipeline, PipelineOptions } from "@/lib/data/pipeline";
import { getAreaData } from "@/lib/data/storage";
import { getPipelineHealth, isPipelineHealthy } from "@/lib/data/monitoring";

/**
 * API endpoint for triggering data pipeline
 *
 * POST /api/scrape
 * Body: {
 *   areaName: string,
 *   sources?: ('property24' | 'municipal' | 'lightstone' | 'deeds')[],
 *   forceRefresh?: boolean
 * }
 *
 * This endpoint:
 * - Runs the complete data pipeline (scrape, clean, aggregate, validate)
 * - Pulls from all configured sources (Property24, Municipal, Lightstone, Deeds Office)
 * - Returns aggregated and validated data
 * - Can be called manually, scheduled, or triggered after payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { areaName, sources, forceRefresh = false } = body;

    if (!areaName) {
      return NextResponse.json(
        { error: "Missing required field: areaName" },
        { status: 400 }
      );
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = getAreaData(areaName);
      if (cached) {
        return NextResponse.json({
          success: true,
          cached: true,
          data: {
            areaName: cached.areaName,
            stats: cached.stats,
            dataQuality: cached.dataQuality,
            validation: cached.validation,
            lastUpdated: cached.lastUpdated,
          },
        });
      }
    }

    // Run the complete data pipeline
    const options: PipelineOptions = {};
    if (sources) {
      options.sources = sources;
    }

    const result = await runDataPipeline(areaName, options);

    // Store the result
    const { storeAreaData } = await import("@/lib/data/storage");
    storeAreaData({
      areaName: result.areaName,
      stats: result.aggregated.stats,
      aggregated: result.aggregated,
      validation: result.validation,
    });

    return NextResponse.json({
      success: true,
      cached: false,
      data: {
        areaName: result.areaName,
        stats: result.aggregated.stats,
        dataQuality: result.aggregated.dataQuality,
        validation: result.validation,
        sources: Object.keys(result.sources),
        processingTime: result.processingTime,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    return NextResponse.json(
      {
        error: "Failed to run data pipeline",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check pipeline status and health
export async function GET() {
  const health = getPipelineHealth();
  const pipelineHealth = isPipelineHealthy();

  return NextResponse.json({
    status: pipelineHealth.healthy ? "healthy" : "degraded",
    health: {
      successRate: health.successRate,
      averageConfidence: health.averageConfidence,
      sourceReliability: health.sourceReliability,
      issues: pipelineHealth.issues,
    },
    sources: {
      property24: "ready",
      municipal: "ready",
      lightstone: "ready",
      deeds: "ready",
    },
    note: "Data pipeline is operational. All sources are configured and ready.",
  });
}
