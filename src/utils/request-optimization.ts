// Request optimization utilities to reduce excessive API calls

// Simple in-memory cache for deduplication
const requestCache = new Map<string, Promise<any>>();
const responseCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

// Cache TTL in milliseconds
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const SHORT_TTL = 30 * 1000; // 30 seconds
const LONG_TTL = 30 * 60 * 1000; // 30 minutes

export interface CacheOptions {
  ttl?: number;
  key?: string;
  dedupe?: boolean;
}

// Deduplicate identical requests
export async function dedupeRequest<T>(
  requestFn: () => Promise<T>,
  cacheKey: string,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = DEFAULT_TTL, dedupe = true } = options;

  // Check if we have a cached response that's still valid
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }

  // Check if there's already a pending request for this key
  if (dedupe && requestCache.has(cacheKey)) {
    const existingRequest = requestCache.get(cacheKey);
    if (existingRequest) {
      return existingRequest;
    }
  }

  // Create new request
  const requestPromise = requestFn()
    .then((data) => {
      // Cache the response
      responseCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl,
      });

      // Remove from pending requests
      requestCache.delete(cacheKey);

      return data;
    })
    .catch((error) => {
      // Remove from pending requests on error
      requestCache.delete(cacheKey);
      throw error;
    });

  // Store pending request
  if (dedupe) {
    requestCache.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

// Throttle function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          func(...args);
          lastExecTime = Date.now();
        },
        delay - (currentTime - lastExecTime),
      );
    }
  };
}

// Debounce function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Batch multiple requests together
export class RequestBatcher<T> {
  private batch: Array<{
    resolve: (value: T) => void;
    reject: (error: any) => void;
    key: string;
  }> = [];
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly batchSize: number;
  private readonly delay: number;
  private readonly batchFn: (keys: string[]) => Promise<T[]>;

  constructor(
    batchFn: (keys: string[]) => Promise<T[]>,
    options: { batchSize?: number; delay?: number } = {},
  ) {
    this.batchFn = batchFn;
    this.batchSize = options.batchSize || 10;
    this.delay = options.delay || 50;
  }

  request(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ resolve, reject, key });

      if (this.batch.length >= this.batchSize) {
        this.flush();
      } else if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  private async flush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const currentBatch = this.batch.splice(0);
    if (currentBatch.length === 0) return;

    try {
      const keys = currentBatch.map((item) => item.key);
      const results = await this.batchFn(keys);

      currentBatch.forEach((item, index) => {
        const result = results[index];
        if (result !== undefined) {
          item.resolve(result);
        } else {
          item.reject(new Error("No result for batch item"));
        }
      });
    } catch (error) {
      currentBatch.forEach((item) => {
        item.reject(error);
      });
    }
  }
}

// Clear caches periodically to prevent memory leaks
export function startCacheCleanup() {
  const cleanup = () => {
    const now = Date.now();

    // Clean expired responses
    for (const [key, cached] of responseCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        responseCache.delete(key);
      }
    }

    // Clean old pending requests (older than 1 minute)
    for (const [key] of requestCache.entries()) {
      // Simple cleanup - remove all pending requests older than 1 minute
      // In a real implementation, you'd track timestamps
      if (requestCache.size > 100) {
        requestCache.clear();
        break;
      }
    }
  };

  // Run cleanup every 5 minutes
  const intervalId = setInterval(cleanup, 5 * 60 * 1000);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    requestCache.clear();
    responseCache.clear();
  };
}

// Export cache utilities
export const cacheUtils = {
  clear: () => {
    requestCache.clear();
    responseCache.clear();
  },
  size: () => ({
    requests: requestCache.size,
    responses: responseCache.size,
  }),
  TTL: {
    SHORT: SHORT_TTL,
    DEFAULT: DEFAULT_TTL,
    LONG: LONG_TTL,
  },
};
