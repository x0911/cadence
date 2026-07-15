import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely, resolving conflicts.
 * Use this in every component instead of template literals.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date as a local calendar date string (YYYY-MM-DD) in the user's timezone.
 * This is the canonical way to get the "local date" for check-in logic.
 */
export function toLocalDateString(
  date: Date,
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");
}

/**
 * Returns today's local date string (YYYY-MM-DD) in the user's timezone.
 */
export function getTodayLocal(timezone?: string): string {
  return toLocalDateString(new Date(), timezone);
}
