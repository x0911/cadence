"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
export type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];

const HABITS_QUERY_KEY = ["habits"] as const;

export function useHabits() {
  const supabase = createClient() as any;

  return useQuery({
    queryKey: HABITS_QUERY_KEY,
    queryFn: async (): Promise<Habit[]> => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .is("archived_at", null)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      return (data || []) as Habit[];
    },
  });
}

export function useHabit(id: string) {
  const supabase = createClient() as any;

  return useQuery({
    queryKey: ["habits", id],
    queryFn: async (): Promise<Habit> => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data as Habit;
    },
    enabled: !!id,
  });
}

export function useCreateHabit() {
  const supabase = createClient() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<HabitInsert, "user_id">): Promise<Habit> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("habits")
        .insert({
          ...input,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Habit;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
  });
}

export function useUpdateHabit() {
  const supabase = createClient() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Omit<HabitUpdate, "id" | "user_id">): Promise<Habit> => {
      const { data, error } = await supabase
        .from("habits")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Habit;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["habits", variables.id] });
    },
  });
}

export function useArchiveHabit() {
  const supabase = createClient() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("habits")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["habits", "archived"] });
      void queryClient.invalidateQueries({ queryKey: ["habits", id] });
      void queryClient.invalidateQueries({ queryKey: ["streak_stats"] });
    },
  });
}

export function useArchivedHabits() {
  const supabase = createClient() as any;

  return useQuery({
    queryKey: ["habits", "archived"] as const,
    queryFn: async (): Promise<Habit[]> => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .not("archived_at", "is", null)
        .order("archived_at", { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as Habit[];
    },
  });
}

export function useRestoreHabit() {
  const supabase = createClient() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("habits")
        .update({ archived_at: null })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["habits", "archived"] });
      void queryClient.invalidateQueries({ queryKey: ["habits", id] });
      void queryClient.invalidateQueries({ queryKey: ["streak_stats"] });
    },
  });
}
