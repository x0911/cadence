"use client";

/**
 * hooks/useHabits.ts — TanStack Query hooks for habits CRUD
 *
 * Phase 0 stub: returns empty/placeholder data so the build compiles without
 * a connected Supabase instance. Full implementation wired in Phase 3.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase/types";

export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
export type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];

const HABITS_QUERY_KEY = ["habits"] as const;

/** Fetch all active (non-archived) habits for the current user */
export function useHabits() {
  return useQuery({
    queryKey: HABITS_QUERY_KEY,
    queryFn: async (): Promise<Habit[]> => {
      // Phase 3: wire to Supabase
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .is("archived_at", null)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Habit[];
    },
    enabled: false, // Phase 3: remove this line
  });
}

/** Fetch a single habit by ID */
export function useHabit(id: string) {
  return useQuery({
    queryKey: ["habits", id],
    queryFn: async (): Promise<Habit> => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data as Habit;
    },
    enabled: false, // Phase 3: set to !!id
  });
}

/** Create a new habit */
export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_input: Omit<HabitInsert, "user_id">): Promise<Habit> => {
      // Phase 3: implement
      throw new Error("Not implemented until Phase 3");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
  });
}

/** Archive (soft-delete) a habit */
export function useArchiveHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_id: string): Promise<void> => {
      // Phase 3: implement
      throw new Error("Not implemented until Phase 3");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
  });
}
