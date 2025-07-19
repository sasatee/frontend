import { CACHE_TIMES } from './constants';

/**
 * Cache configuration for different resource types
 */
export const CACHE_CONFIG = {
  // User-related resources (frequently updated)
  USER: {
    staleTime: CACHE_TIMES.SHORT, // 1 minute
    cacheTime: CACHE_TIMES.MEDIUM, // 5 minutes
  },

  // Employee-related resources (moderately updated)
  EMPLOYEE: {
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    cacheTime: CACHE_TIMES.LONG, // 30 minutes
  },

  // Department-related resources (infrequently updated)
  DEPARTMENT: {
    staleTime: CACHE_TIMES.LONG, // 30 minutes
    cacheTime: CACHE_TIMES.VERY_LONG, // 1 hour
  },

  // Job-related resources (infrequently updated)
  JOB: {
    staleTime: CACHE_TIMES.LONG, // 30 minutes
    cacheTime: CACHE_TIMES.VERY_LONG, // 1 hour
  },

  // Leave-related resources (frequently updated)
  LEAVE: {
    staleTime: CACHE_TIMES.SHORT, // 1 minute
    cacheTime: CACHE_TIMES.MEDIUM, // 5 minutes
  },

  // Attendance-related resources (frequently updated)
  ATTENDANCE: {
    staleTime: CACHE_TIMES.SHORT, // 1 minute
    cacheTime: CACHE_TIMES.MEDIUM, // 5 minutes
  },

  // Payroll-related resources (moderately updated)
  PAYROLL: {
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    cacheTime: CACHE_TIMES.LONG, // 30 minutes
  },

  // Role-related resources (infrequently updated)
  ROLE: {
    staleTime: CACHE_TIMES.LONG, // 30 minutes
    cacheTime: CACHE_TIMES.VERY_LONG, // 1 hour
  },

  // Category-related resources (infrequently updated)
  CATEGORY: {
    staleTime: CACHE_TIMES.LONG, // 30 minutes
    cacheTime: CACHE_TIMES.VERY_LONG, // 1 hour
  },

  // Default configuration for other resources
  DEFAULT: {
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    cacheTime: CACHE_TIMES.LONG, // 30 minutes
  },
} as const;

/**
 * Get cache configuration for a specific resource type
 */
export function getCacheConfig(resourceType: keyof typeof CACHE_CONFIG) {
  return CACHE_CONFIG[resourceType] || CACHE_CONFIG.DEFAULT;
}
