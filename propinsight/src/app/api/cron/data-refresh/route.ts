import { NextRequest, NextResponse } from "next/server";
import { runScheduledTasks } from "@/lib/data/scheduler";
import { clearExpiredCache } from "@/lib/data/storage";

/**
 * Cron endpoint for scheduled data refresh
 * 
 * This endpoint should be called by Vercel Cron Jobs or similar scheduler
 * 
 * Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/data-refresh",
 *     "schedule": "0 0,6,12,18 * * *"  // Every 6 hours
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Verify this is a cron request (optional security check)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting scheduled data refresh...");

    // Clear expired cache entries
    const expiredCount = clearExpiredCache();
    if (expiredCount > 0) {
      console.log(`[Cron] Cleared ${expiredCount} expired cache entries`);
    }

    // Run scheduled tasks
    const results = await runScheduledTasks();

    console.log(`[Cron] Completed data refresh: ${results.length} areas processed`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredCacheCleared: expiredCount,
      areasProcessed: results.length,
      results: results.map((r) => ({
        areaName: r.areaName,
        processingTime: r.processingTime,
        validation: r.validation.isValid,
        confidence: r.validation.confidence,
      })),
    });
  } catch (error) {
    console.error("[Cron] Error during data refresh:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
