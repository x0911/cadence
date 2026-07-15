"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const PROFILE_QUERY_KEY = ["profile"] as const;

export function useProfile() {
  const supabase = createClient() as any;

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async (): Promise<Profile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create it (should be handled by trigger, but double-safe)
        if (error.code === "PGRST116") {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              display_name: user.email?.split("@")[0] || "User",
              timezone: tz,
              visuals_3d_enabled: true,
              weekly_email_enabled: true,
            } as any)
            .select()
            .single();

          if (createError) throw new Error(createError.message);
          return newProfile as Profile;
        }
        throw new Error(error.message);
      }

      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const supabase = createClient() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Omit<ProfileUpdate, "id">): Promise<Profile> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates as any)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Profile;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
