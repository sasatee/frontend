import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTime(timeString: string | null | undefined): Date | null {
  if (!timeString) return null;

  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    return null;
  }
}

export function calculateWorkHours(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined
): number {
  if (!checkIn || !checkOut) return 0;

  const checkInTime = parseTime(checkIn);
  const checkOutTime = parseTime(checkOut);

  if (!checkInTime || !checkOutTime) return 0;

  let diffInMs = checkOutTime.getTime() - checkInTime.getTime();

  // If the difference is negative, it means checkout is on the next day
  if (diffInMs < 0) {
    diffInMs += 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
  }

  return Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
}

export function getAttendanceStatus(checkInTime: string, checkOutTime: string) {
  return checkInTime && checkOutTime ? 'Completed' : checkInTime ? 'In Progress' : 'Not Started';
}

export function formatWorkHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString()}`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function generatePagination(currentPage: number, totalPages: number) {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

// Form Sanitization Functions

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - String input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return typeof input === 'string' ? DOMPurify.sanitize(input.trim()) : '';
}

/**
 * Sanitizes HTML content while allowing safe tags
 * @param htmlContent - HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(htmlContent: string): string {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitizes an object's string properties
 * @param obj - Object with properties to sanitize
 * @returns New object with sanitized string properties
 */
export function sanitizeObject<T>(obj: T): T {
  // For null or non-objects, return as is
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  // Create a new object with the same prototype
  const result = Object.create(Object.getPrototypeOf(obj));

  // Copy and sanitize all properties
  Object.entries(obj).forEach(([key, value]) => {
    // Log the types
    console.log(`Sanitizing property ${key}:`, value, `type: ${typeof value}`);

    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (typeof value === 'number') {
      // Preserve numbers exactly as they are
      result[key] = value;
      console.log(`Preserved numeric value for ${key}:`, value);
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  });

  console.log('Sanitized result:', result);
  return result;
}

/**
 * Utility to strip HTML tags completely
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Validates a value for use in SelectItem components
 * Prevents empty strings and undefined values that cause Radix UI errors
 */
export function validateSelectValue(value: any): boolean {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Filters an array of objects to only include items with valid IDs for SelectItem
 */
export function filterValidSelectItems<T extends { id: any }>(items: T[]): T[] {
  return items.filter((item) => validateSelectValue(item.id));
}
