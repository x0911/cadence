/**
 * lib/streaks.ts — pure streak calculation functions
 *
 * These mirror the SQL get_current_streak() function from §3, running on
 * the client side for optimistic UI updates. Vitest unit-tested in Phase 3.
 *
 * IMPORTANT: All date comparisons use local calendar dates (YYYY-MM-DD strings),
 * never raw UTC timestamps — see §0 Q on timezones.
 */

import { getTodayLocal, toLocalDateString } from "./utils";

/**
 * Given a sorted array of checked-in date strings (YYYY-MM-DD, ascending),
 * compute the current streak from today or yesterday (same logic as SQL function).
 *
 * @param checkedInDates - Array of date strings the habit was checked in
 * @param timezone       - IANA timezone string (e.g. "America/New_York")
 * @returns Current streak count (0 if no active streak)
 */
export function computeCurrentStreak(
  checkedInDates: string[],
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): number {
  const dateSet = new Set(checkedInDates);
  const today = getTodayLocal(timezone);

  // Determine anchor: today if checked in, otherwise yesterday
  let anchor: string;
  if (dateSet.has(today)) {
    anchor = today;
  } else {
    anchor = offsetDate(today, -1);
  }

  // Walk backward from anchor, counting consecutive days
  let streak = 0;
  let cursor = anchor;

  while (dateSet.has(cursor)) {
    streak++;
    cursor = offsetDate(cursor, -1);
  }

  return streak;
}

/**
 * Compute the longest-ever streak from an array of check-in dates.
 */
export function computeLongestStreak(checkedInDates: string[]): number {
  if (checkedInDates.length === 0) return 0;

  const sorted = [...checkedInDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr === offsetDate(prev, 1)) {
      current++;
      longest = Math.max(longest, current);
    } else if (curr !== prev) {
      current = 1;
    }
  }

  return longest;
}

/**
 * Offset a YYYY-MM-DD date string by `days` days.
 */
export function offsetDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toLocalDateString(d, "UTC"); // Use UTC since input is UTC midnight
}

/**
 * Check if a given date string is today in the user's timezone.
 */
export function isToday(dateStr: string, timezone?: string): boolean {
  return dateStr === getTodayLocal(timezone);
}

/**
 * Determine if a milestone was newly crossed.
 * Returns the crossed milestone value or null.
 */
export function getMilestoneCrossed(
  previousStreak: number,
  newStreak: number
): number | null {
  const milestones = [7, 30, 100, 365];
  for (const m of milestones) {
    if (previousStreak < m && newStreak >= m) return m;
  }
  return null;
}
