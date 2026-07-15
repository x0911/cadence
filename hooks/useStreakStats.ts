"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { computeCurrentStreak, computeLongestStreak } from "@/lib/streaks";

export interface StreakStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  checkedInDates: string[];
}

const streakStatsKey = (habitId: string) => ["streak_stats", habitId] as const;

export function useStreakStats(habitId: string, timezone: string) {
  const supabase = createClient() as any;

  return useQuery({
    queryKey: streakStatsKey(habitId),
    queryFn: async (): Promise<StreakStats> => {
      const { data, error } = await supabase
        .from("check_ins")
        .select("checked_in_date")
        .eq("habit_id", habitId)
        .order("checked_in_date", { ascending: true });

      if (error) throw new Error(error.message);

      const dates = (data || []).map((r: any) => r.checked_in_date);
      return {
        habitId,
        currentStreak: computeCurrentStreak(dates, timezone),
        longestStreak: computeLongestStreak(dates),
        totalCheckIns: dates.length,
        checkedInDates: dates,
      };
    },
    enabled: !!habitId,
  });
}
