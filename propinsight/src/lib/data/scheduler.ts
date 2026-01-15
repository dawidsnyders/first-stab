// Data pipeline scheduler
// Handles scheduled data collection and refresh cycles

import { runDataPipeline, PipelineResult } from "./pipeline";
import {
  storeAreaData,
  getAreaData,
  needsRefresh,
  clearExpiredCache,
} from "./storage";
import { Area } from "@/types";
import { sampleAreas } from "@/data/areas";

export interface ScheduledTask {
  areaName: string;
  interval: number; // milliseconds
  lastRun?: Date;
  nextRun: Date;
  enabled: boolean;
}

// In-memory task registry
const scheduledTasks = new Map<string, ScheduledTask>();

// Default refresh interval: 24 hours
const DEFAULT_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

/**
 * Schedule data collection for an area
 */
export function scheduleArea(
  areaName: string,
  interval: number = DEFAULT_REFRESH_INTERVAL
): void {
  const task: ScheduledTask = {
    areaName,
    interval,
    nextRun: new Date(Date.now() + interval),
    enabled: true,
  };

  scheduledTasks.set(areaName.toLowerCase(), task);
  console.log(
    `[Scheduler] Scheduled ${areaName} for refresh every ${
      interval / 1000 / 60 / 60
    } hours`
  );
}

/**
 * Schedule multiple areas
 */
export function scheduleAreas(
  areaNames: string[],
  interval: number = DEFAULT_REFRESH_INTERVAL
): void {
  for (const areaName of areaNames) {
    scheduleArea(areaName, interval);
  }
}

/**
 * Schedule all areas from the areas data
 */
export function scheduleAllAreas(
  interval: number = DEFAULT_REFRESH_INTERVAL
): void {
  const areaNames = sampleAreas.map((area) => area.name);
  scheduleAreas(areaNames, interval);
}

/**
 * Run scheduled tasks that are due
 */
export async function runScheduledTasks(): Promise<PipelineResult[]> {
  const now = new Date();
  const dueTasks: ScheduledTask[] = [];

  for (const task of scheduledTasks.values()) {
    if (task.enabled && task.nextRun <= now) {
      dueTasks.push(task);
    }
  }

  if (dueTasks.length === 0) {
    return [];
  }

  console.log(`[Scheduler] Running ${dueTasks.length} scheduled task(s)...`);

  const results: PipelineResult[] = [];

  for (const task of dueTasks) {
    try {
      console.log(`[Scheduler] Processing ${task.areaName}...`);
      const result = await runDataPipeline(task.areaName);

      // Store the result
      storeAreaData({
        areaName: result.areaName,
        stats: result.aggregated.stats,
        aggregated: result.aggregated,
        validation: result.validation,
      });

      // Update task schedule
      task.lastRun = now;
      task.nextRun = new Date(now.getTime() + task.interval);

      results.push(result);
    } catch (error) {
      console.error(`[Scheduler] Error processing ${task.areaName}:`, error);
      // Reschedule for retry in 1 hour
      task.nextRun = new Date(now.getTime() + 60 * 60 * 1000);
    }
  }

  return results;
}

/**
 * Refresh data for an area if needed
 */
export async function refreshAreaIfNeeded(
  areaName: string
): Promise<PipelineResult | null> {
  if (!needsRefresh(areaName)) {
    const cached = getAreaData(areaName);
    console.log(
      `[Scheduler] Using cached data for ${areaName} (updated ${cached?.lastUpdated})`
    );
    return null;
  }

  console.log(`[Scheduler] Refreshing data for ${areaName}...`);
  const result = await runDataPipeline(areaName);

  storeAreaData({
    areaName: result.areaName,
    stats: result.aggregated.stats,
    aggregated: result.aggregated,
    validation: result.validation,
  });

  return result;
}

/**
 * Start the scheduler (runs every hour)
 */
export function startScheduler(interval: number = 60 * 60 * 1000): () => void {
  console.log(
    `[Scheduler] Starting scheduler (checking every ${
      interval / 1000 / 60
    } minutes)...`
  );

  // Run immediately on start
  runScheduledTasks().catch((error) => {
    console.error("[Scheduler] Error in initial run:", error);
  });

  // Clear expired cache on start
  const expiredCount = clearExpiredCache();
  if (expiredCount > 0) {
    console.log(`[Scheduler] Cleared ${expiredCount} expired cache entries`);
  }

  // Set up interval
  const intervalId = setInterval(async () => {
    try {
      // Clear expired cache
      clearExpiredCache();

      // Run scheduled tasks
      await runScheduledTasks();
    } catch (error) {
      console.error("[Scheduler] Error in scheduled run:", error);
    }
  }, interval);

  // Return stop function
  return () => {
    clearInterval(intervalId);
    console.log("[Scheduler] Scheduler stopped");
  };
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  totalTasks: number;
  enabledTasks: number;
  nextRun: Date | null;
  tasks: Array<{ areaName: string; nextRun: Date; lastRun?: Date }>;
} {
  const tasks = Array.from(scheduledTasks.values());
  const enabled = tasks.filter((t) => t.enabled);

  const nextRuns = enabled.map((t) => t.nextRun);
  const nextRun =
    nextRuns.length > 0
      ? new Date(Math.min(...nextRuns.map((d) => d.getTime())))
      : null;

  return {
    totalTasks: tasks.length,
    enabledTasks: enabled.length,
    nextRun,
    tasks: tasks.map((t) => ({
      areaName: t.areaName,
      nextRun: t.nextRun,
      lastRun: t.lastRun,
    })),
  };
}
