import { NextRequest, NextResponse } from "next/server";
import {
  scheduleArea,
  scheduleAreas,
  scheduleAllAreas,
  runScheduledTasks,
  refreshAreaIfNeeded,
  getSchedulerStatus,
  startScheduler,
} from "@/lib/data/scheduler";

/**
 * GET /api/data/scheduler
 * Get scheduler status
 */
export async function GET() {
  const status = getSchedulerStatus();

  return NextResponse.json({
    status: "operational",
    scheduler: status,
  });
}

/**
 * POST /api/data/scheduler
 * Control scheduler operations
 * Body: { action: 'schedule' | 'run' | 'refresh', areaName?: string, areas?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, areaName, areas, interval } = body;

    switch (action) {
      case "schedule":
        if (areaName) {
          scheduleArea(areaName, interval);
          return NextResponse.json({
            success: true,
            message: `Scheduled ${areaName} for data collection`,
          });
        } else if (areas && Array.isArray(areas)) {
          scheduleAreas(areas, interval);
          return NextResponse.json({
            success: true,
            message: `Scheduled ${areas.length} areas for data collection`,
          });
        } else {
          scheduleAllAreas(interval);
          return NextResponse.json({
            success: true,
            message: "Scheduled all areas for data collection",
          });
        }

      case "run":
        const results = await runScheduledTasks();
        return NextResponse.json({
          success: true,
          message: `Ran ${results.length} scheduled tasks`,
          results: results.map((r) => ({
            areaName: r.areaName,
            processingTime: r.processingTime,
            validation: r.validation.isValid,
          })),
        });

      case "refresh":
        if (!areaName) {
          return NextResponse.json(
            { error: "areaName required for refresh action" },
            { status: 400 }
          );
        }
        const result = await refreshAreaIfNeeded(areaName);
        if (result) {
          return NextResponse.json({
            success: true,
            message: `Refreshed data for ${areaName}`,
            result: {
              areaName: result.areaName,
              stats: result.aggregated.stats,
              validation: result.validation,
            },
          });
        } else {
          return NextResponse.json({
            success: true,
            message: `Using cached data for ${areaName}`,
            cached: true,
          });
        }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Scheduler error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute scheduler action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
