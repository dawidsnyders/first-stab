// Monitoring and logging system for data pipeline
// Tracks pipeline health, performance, and data quality metrics

export interface PipelineMetrics {
  timestamp: string;
  areaName: string;
  sources: {
    property24: { success: boolean; duration: number; error?: string };
    municipal: { success: boolean; duration: number; error?: string };
    lightstone: { success: boolean; duration: number; error?: string };
    deeds: { success: boolean; duration: number; error?: string };
  };
  processing: {
    totalProperties: number;
    cleaned: number;
    removed: number;
    duplicates: number;
  };
  validation: {
    isValid: boolean;
    confidence: number;
    errors: number;
    warnings: number;
  };
  performance: {
    totalDuration: number;
    scrapeDuration: number;
    cleaningDuration: number;
    aggregationDuration: number;
    validationDuration: number;
  };
}

// In-memory metrics storage (in production, use a time-series database)
const metricsHistory: PipelineMetrics[] = [];
const MAX_HISTORY = 1000; // Keep last 1000 runs

/**
 * Record pipeline metrics
 */
export function recordMetrics(metrics: PipelineMetrics): void {
  metricsHistory.push(metrics);

  // Keep only recent history
  if (metricsHistory.length > MAX_HISTORY) {
    metricsHistory.shift();
  }

  // Log summary
  console.log(
    `[Monitoring] Pipeline run for ${metrics.areaName}: ${
      metrics.validation.isValid ? "✓" : "✗"
    } ` +
      `(${metrics.processing.totalProperties} properties, ${metrics.validation.confidence}% confidence, ${metrics.performance.totalDuration}ms)`
  );
}

/**
 * Get recent metrics for an area
 */
export function getAreaMetrics(
  areaName: string,
  limit: number = 10
): PipelineMetrics[] {
  return metricsHistory
    .filter((m) => m.areaName.toLowerCase() === areaName.toLowerCase())
    .slice(-limit)
    .reverse();
}

/**
 * Get overall pipeline health
 */
export function getPipelineHealth(): {
  totalRuns: number;
  successRate: number;
  averageConfidence: number;
  averageDuration: number;
  sourceReliability: {
    property24: number;
    municipal: number;
    lightstone: number;
    deeds: number;
  };
  recentErrors: Array<{ areaName: string; timestamp: string; error: string }>;
} {
  if (metricsHistory.length === 0) {
    return {
      totalRuns: 0,
      successRate: 0,
      averageConfidence: 0,
      averageDuration: 0,
      sourceReliability: {
        property24: 0,
        municipal: 0,
        lightstone: 0,
        deeds: 0,
      },
      recentErrors: [],
    };
  }

  const recent = metricsHistory.slice(-100); // Last 100 runs

  const successCount = recent.filter((m) => m.validation.isValid).length;
  const successRate = (successCount / recent.length) * 100;

  const averageConfidence =
    recent.reduce((sum, m) => sum + m.validation.confidence, 0) / recent.length;

  const averageDuration =
    recent.reduce((sum, m) => sum + m.performance.totalDuration, 0) /
    recent.length;

  // Calculate source reliability
  const sourceCounts = {
    property24: { success: 0, total: 0 },
    municipal: { success: 0, total: 0 },
    lightstone: { success: 0, total: 0 },
    deeds: { success: 0, total: 0 },
  };

  for (const metric of recent) {
    for (const [source, data] of Object.entries(metric.sources)) {
      if (source in sourceCounts) {
        const key = source as keyof typeof sourceCounts;
        sourceCounts[key].total++;
        if (data.success) {
          sourceCounts[key].success++;
        }
      }
    }
  }

  const sourceReliability = {
    property24:
      sourceCounts.property24.total > 0
        ? (sourceCounts.property24.success / sourceCounts.property24.total) *
          100
        : 0,
    municipal:
      sourceCounts.municipal.total > 0
        ? (sourceCounts.municipal.success / sourceCounts.municipal.total) * 100
        : 0,
    lightstone:
      sourceCounts.lightstone.total > 0
        ? (sourceCounts.lightstone.success / sourceCounts.lightstone.total) *
          100
        : 0,
    deeds:
      sourceCounts.deeds.total > 0
        ? (sourceCounts.deeds.success / sourceCounts.deeds.total) * 100
        : 0,
  };

  // Collect recent errors
  const recentErrors: Array<{
    areaName: string;
    timestamp: string;
    error: string;
  }> = [];
  for (const metric of recent.slice(-20).reverse()) {
    for (const [source, data] of Object.entries(metric.sources)) {
      if (!data.success && data.error) {
        recentErrors.push({
          areaName: metric.areaName,
          timestamp: metric.timestamp,
          error: `${source}: ${data.error}`,
        });
      }
    }
  }

  return {
    totalRuns: metricsHistory.length,
    successRate: Math.round(successRate * 10) / 10,
    averageConfidence: Math.round(averageConfidence * 10) / 10,
    averageDuration: Math.round(averageDuration),
    sourceReliability,
    recentErrors: recentErrors.slice(0, 10),
  };
}

/**
 * Get data quality trends
 */
export function getDataQualityTrends(
  areaName: string,
  days: number = 7
): {
  dates: string[];
  confidence: number[];
  propertyCount: number[];
  errors: number[];
} {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const relevant = metricsHistory.filter(
    (m) =>
      m.areaName.toLowerCase() === areaName.toLowerCase() &&
      new Date(m.timestamp) >= cutoff
  );

  const dates: string[] = [];
  const confidence: number[] = [];
  const propertyCount: number[] = [];
  const errors: number[] = [];

  for (const metric of relevant) {
    dates.push(new Date(metric.timestamp).toISOString().split("T")[0]);
    confidence.push(metric.validation.confidence);
    propertyCount.push(metric.processing.totalProperties);
    errors.push(metric.validation.errors);
  }

  return { dates, confidence, propertyCount, errors };
}

/**
 * Check if pipeline is healthy
 */
export function isPipelineHealthy(): {
  healthy: boolean;
  issues: string[];
} {
  const health = getPipelineHealth();
  const issues: string[] = [];

  if (health.successRate < 80) {
    issues.push(`Low success rate: ${health.successRate}%`);
  }

  if (health.averageConfidence < 70) {
    issues.push(`Low average confidence: ${health.averageConfidence}%`);
  }

  for (const [source, reliability] of Object.entries(
    health.sourceReliability
  )) {
    if (reliability < 70) {
      issues.push(`Low reliability for ${source}: ${reliability}%`);
    }
  }

  if (health.recentErrors.length > 5) {
    issues.push(
      `High error count: ${health.recentErrors.length} recent errors`
    );
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}
