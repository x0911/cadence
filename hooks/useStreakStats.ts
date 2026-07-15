"use client";

/**
 * hooks/useStreakStats.ts — streak stats per habit using TanStack Query
 * Phase 0 stub — full implementation in Phase 3.
 */
import { useQuery } from "@tanstack/react-query";
import { computeCurrentStreak, computeLongestStreak } from "@/lib/streaks";

export interface StreakStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  checkedInDates: string[];
}

export function useStreakStats(habitId: string, timezone: string) {
  return useQuery({
    queryKey: ["streak_stats", habitId, timezone],
    queryFn: async (): Promise<StreakStats> => {
      // Phase 3: wire to Supabase check_ins query
      const dates: string[] = [];
      return {
        habitId,
        currentStreak: computeCurrentStreak(dates, timezone),
        longestStreak: computeLongestStreak(dates),
        totalCheckIns: dates.length,
        checkedInDates: dates,
      };
    },
    enabled: false, // Phase 3: set to !!habitId
  });
}
