"use client";

/**
 * hooks/useCheckIn.ts — TanStack Query mutation for habit check-ins
 *
 * Phase 0 stub: compiles without a Supabase connection.
 * Full optimistic-update implementation in Phase 3.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase/types";

export type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];

const checkInsKey = (habitId: string) => ["check_ins", habitId] as const;

/** Fetch all check-ins for a given habit */
export function useCheckIns(habitId: string) {
  return useQuery({
    queryKey: checkInsKey(habitId),
    queryFn: async (): Promise<CheckIn[]> => {
      // Phase 3: wire to Supabase
      return [];
    },
    enabled: false, // Phase 3: set to !!habitId
  });
}

/** Toggle a check-in for today — optimistic update in Phase 3 */
export function useCheckIn(habitId: string, _timezone: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_vars: { isCheckedIn: boolean }): Promise<CheckIn | null> => {
      // Phase 3: implement with optimistic update
      throw new Error("Not implemented until Phase 3");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: checkInsKey(habitId) });
    },
  });
}
