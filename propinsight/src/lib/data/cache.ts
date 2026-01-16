// Simple in-memory cache for pipeline results
// Reduces redundant processing for same area within short time window

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default: 5 minutes
    this.defaultTTL = defaultTTL;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache for pipeline results (short TTL to allow fresh data)
export const pipelineCache = new SimpleCache<any>(2 * 60 * 1000); // 2 minutes

// Cache for aggregated stats (longer TTL)
export const statsCache = new SimpleCache<any>(10 * 60 * 1000); // 10 minutes

// Periodic cleanup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    pipelineCache.cleanup();
    statsCache.cleanup();
  }, 60 * 1000); // Cleanup every minute
}
