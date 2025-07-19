export const CACHE_TIMES = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

export const DEFAULT_RETRY_COUNT = 2;
export const DEFAULT_RETRY_DELAY = 1000; // 1 second
