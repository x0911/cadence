// Placeholder types — will be replaced by `supabase gen types typescript` in Phase 1
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          timezone: string;
          visuals_3d_enabled: boolean;
          weekly_email_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          timezone?: string;
          visuals_3d_enabled?: boolean;
          weekly_email_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          timezone?: string;
          visuals_3d_enabled?: boolean;
          weekly_email_enabled?: boolean;
          created_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          frequency: string;
          custom_days: number[] | null;
          focus_mode: boolean;
          focus_duration_seconds: number | null;
          archived_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          frequency?: string;
          custom_days?: number[] | null;
          focus_mode?: boolean;
          focus_duration_seconds?: number | null;
          archived_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          frequency?: string;
          custom_days?: number[] | null;
          focus_mode?: boolean;
          focus_duration_seconds?: number | null;
          archived_at?: string | null;
          created_at?: string;
        };
      };
      check_ins: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          checked_in_date: string;
          note: string | null;
          focus_duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          checked_in_date: string;
          note?: string | null;
          focus_duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          checked_in_date?: string;
          note?: string | null;
          focus_duration_seconds?: number | null;
          created_at?: string;
        };
      };
      habit_milestones: {
        Row: {
          id: string;
          habit_id: string;
          milestone_value: number;
          achieved_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          milestone_value: number;
          achieved_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          milestone_value?: number;
          achieved_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_current_streak: {
        Args: { p_habit_id: string; p_timezone: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
  };
}
