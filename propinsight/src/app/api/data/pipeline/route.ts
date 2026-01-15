import { NextRequest, NextResponse } from "next/server";
import { runDataPipeline, PipelineOptions } from "@/lib/data/pipeline";
import { getAreaData, getCacheStats } from "@/lib/data/storage";
import { getPipelineHealth, getAreaMetrics } from "@/lib/data/monitoring";
import { getSchedulerStatus } from "@/lib/data/scheduler";

/**
 * GET /api/data/pipeline
 * Get pipeline status, health, and statistics
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const areaName = searchParams.get("area");

  if (areaName) {
    // Get metrics for specific area
    const metrics = getAreaMetrics(areaName, 10);
    const cached = getAreaData(areaName);

    return NextResponse.json({
      areaName,
      metrics: metrics.slice(0, 10),
      cached: cached
        ? {
            stats: cached.stats,
            dataQuality: cached.dataQuality,
            lastUpdated: cached.lastUpdated,
          }
        : null,
    });
  }

  // Get overall pipeline status
  const health = getPipelineHealth();
  const scheduler = getSchedulerStatus();
  const cache = getCacheStats();

  return NextResponse.json({
    status: "operational",
    health: {
      successRate: health.successRate,
      averageConfidence: health.averageConfidence,
      sourceReliability: health.sourceReliability,
      recentErrors: health.recentErrors,
    },
    scheduler: {
      totalTasks: scheduler.totalTasks,
      enabledTasks: scheduler.enabledTasks,
      nextRun: scheduler.nextRun,
    },
    cache: {
      totalAreas: cache.totalAreas,
      totalProperties: cache.totalProperties,
      averageConfidence: cache.averageConfidence,
    },
  });
}

/**
 * POST /api/data/pipeline
 * Trigger pipeline run for an area
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
      result: {
        areaName: result.areaName,
        stats: result.aggregated.stats,
        validation: result.validation,
        processingTime: result.processingTime,
      },
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    return NextResponse.json(
      {
        error: "Failed to run pipeline",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
