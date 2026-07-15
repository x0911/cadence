"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTodayLocal } from "@/lib/utils";
import { computeCurrentStreak, computeLongestStreak } from "@/lib/streaks";
import type { Database } from "@/lib/supabase/types";

export type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];

const checkInsKey = (habitId: string) => ["check_ins", habitId] as const;
const streakStatsKey = (habitId: string) => ["streak_stats", habitId] as const;

export function useCheckIns(habitId: string) {
  const supabase = createClient() as any;

  return useQuery({
    queryKey: checkInsKey(habitId),
    queryFn: async (): Promise<CheckIn[]> => {
      const { data, error } = await supabase
        .from("check_ins")
        .select("*")
        .eq("habit_id", habitId)
        .order("checked_in_date", { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as CheckIn[];
    },
    enabled: !!habitId,
  });
}

export function useCheckIn(habitId: string, timezone: string) {
  const supabase = createClient() as any;
  const queryClient = useQueryClient();
  const today = getTodayLocal(timezone);

  return useMutation({
    mutationFn: async ({ isCheckedIn, note, focusDurationSeconds }: {
      isCheckedIn: boolean;
      note?: string;
      focusDurationSeconds?: number;
    }): Promise<CheckIn | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isCheckedIn) {
        // Un-check: delete today's check-in
        const { error } = await supabase
          .from("check_ins")
          .delete()
          .eq("habit_id", habitId)
          .eq("checked_in_date", today);

        if (error) throw new Error(error.message);
        return null;
      } else {
        // Check-in: insert row for today
        const { data, error } = await supabase
          .from("check_ins")
          .insert({
            habit_id: habitId,
            user_id: user.id,
            checked_in_date: today,
            note: note || null,
            focus_duration_seconds: focusDurationSeconds || null,
          } as any)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data as CheckIn;
      }
    },
    // Optimistic Update
    onMutate: async ({ isCheckedIn }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: checkInsKey(habitId) });
      await queryClient.cancelQueries({ queryKey: streakStatsKey(habitId) });

      // Snapshot previous values
      const prevCheckIns = queryClient.getQueryData<CheckIn[]>(checkInsKey(habitId));
      const prevStreakStats = queryClient.getQueryData<any>(streakStatsKey(habitId));

      // Optimistically update check-ins list
      queryClient.setQueryData<CheckIn[]>(checkInsKey(habitId), (old = []) => {
        if (isCheckedIn) {
          return old.filter((ci) => ci.checked_in_date !== today);
        } else {
          return [
            {
              id: "optimistic-id",
              habit_id: habitId,
              user_id: "optimistic-user",
              checked_in_date: today,
              note: null,
              focus_duration_seconds: null,
              created_at: new Date().toISOString(),
            },
            ...old,
          ];
        }
      });

      // Optimistically update streak stats
      queryClient.setQueryData<any>(streakStatsKey(habitId), (old: any) => {
        if (!old) return old;
        const newDates = isCheckedIn
          ? old.checkedInDates.filter((d: string) => d !== today)
          : [...old.checkedInDates, today].sort();
        
        // Recompute streak on the fly (statically imported)
        const currentStreak = computeCurrentStreak(newDates, timezone);
        const longestStreak = Math.max(old.longestStreak, currentStreak);

        return {
          ...old,
          currentStreak,
          longestStreak,
          totalCheckIns: newDates.length,
          checkedInDates: newDates,
        };
      });

      return { prevCheckIns, prevStreakStats };
    },
    onError: (_err, _vars, context) => {
      // Roll back
      if (context?.prevCheckIns) {
        queryClient.setQueryData(checkInsKey(habitId), context.prevCheckIns);
      }
      if (context?.prevStreakStats) {
        queryClient.setQueryData(streakStatsKey(habitId), context.prevStreakStats);
      }
    },
    onSuccess: async (data, vars) => {
      // If checked in today (vars.isCheckedIn is false, meaning we checked in):
      if (!vars.isCheckedIn && data) {
        // Query cache for habit name/color and current streak stats
        const habits = queryClient.getQueryData<any[]>(["habits"]);
        const habit = habits?.find((h) => h.id === habitId);
        const stats = queryClient.getQueryData<any>(streakStatsKey(habitId));

        if (habit && stats) {
          const prevStreak = stats.currentStreak;
          const newStreak = prevStreak + 1; // optimistic check
          const milestones = [7, 30, 100, 365];
          
          if (milestones.includes(newStreak)) {
            // Write milestone record to database
            const { error: mErr } = await supabase
              .from("habit_milestones")
              .insert({
                habit_id: habitId,
                milestone_value: newStreak,
              } as any);

            // If database insert succeeded (no constraint error), enqueue celebration!
            if (!mErr) {
              const { useUIStore } = require("@/store/ui-store");
              useUIStore.getState().enqueueCelebration({
                habitId,
                habitName: habit.name,
                milestoneValue: newStreak,
                color: habit.color,
              });
            }
          }
        }
      }
    },
    onSettled: () => {
      // Refetch stats and check-ins
      void queryClient.invalidateQueries({ queryKey: checkInsKey(habitId) });
      void queryClient.invalidateQueries({ queryKey: streakStatsKey(habitId) });
      // Invalidate global stats for 3D orb
      void queryClient.invalidateQueries({ queryKey: ["global_streak_stats"] });
    },
  });
}

export function useLogMilestone() {
  const supabase = createClient() as any;
  return useMutation({
    mutationFn: async ({ habitId, milestoneValue }: { habitId: string; milestoneValue: number }) => {
      const { data, error } = await supabase
        .from("habit_milestones")
        .insert({
          habit_id: habitId,
          milestone_value: milestoneValue,
        } as any)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") { // unique constraint violation
          return null;
        }
        throw new Error(error.message);
      }
      return data;
    },
  });
}
