"use client";

import { useHabits } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";
import { useUIStore } from "@/store/ui-store";
import { HabitCard } from "@/components/features/habit-card";
import { HabitDialog } from "@/components/features/habit-dialog";
import { StreakOrb } from "@/components/features/streak-orb/streak-orb";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { computeCurrentStreak } from "@/lib/streaks";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Settings, LogOut, Flame, Sparkles, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setCreateHabitOpen } = useUIStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: habits, isLoading: isHabitsLoading } = useHabits();

  const timezone = profile?.timezone || "UTC";

  // Query global stats for the Streak Orb
  const { data: globalStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["global_streak_stats", habits, timezone],
    queryFn: async () => {
      if (!habits || habits.length === 0) {
        return { maxStreak: 0, strengthLevel: 0 as const, activeHabitsCount: 0 };
      }

      // Fetch check-ins for all active habits
      const habitIds = habits.map((h) => h.id);
      const { data, error } = await supabase
        .from("check_ins")
        .select("habit_id, checked_in_date")
        .in("habit_id", habitIds);

      if (error) throw new Error(error.message);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const checkIns = (data || []) as any[];

      const checkInsByHabit: Record<string, string[]> = {};
      habitIds.forEach((id) => (checkInsByHabit[id] = []));
      checkIns.forEach((row) => {
        if (checkInsByHabit[row.habit_id]) {
          checkInsByHabit[row.habit_id].push(row.checked_in_date);
        }
      });

      let maxStreak = 0;
      Object.keys(checkInsByHabit).forEach((id) => {
        const streak = computeCurrentStreak(checkInsByHabit[id], timezone);
        if (streak > maxStreak) maxStreak = streak;
      });

      // Compute Strength Level: 0 = dormant, 1 = building, 2 = established, 3 = strong
      let strengthLevel: 0 | 1 | 2 | 3 = 0;
      if (maxStreak > 0) {
        if (maxStreak >= 30) strengthLevel = 3;
        else if (maxStreak >= 7) strengthLevel = 2;
        else strengthLevel = 1;
      }

      return {
        maxStreak,
        strengthLevel,
        activeHabitsCount: habits.length,
      };
    },
    enabled: !!habits,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have successfully logged out.",
    });
    router.push("/login");
    router.refresh();
  };

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const isLoading = isProfileLoading || isHabitsLoading || isStatsLoading;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {/* Premium Dashboard Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
              <Flame className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Cadence
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-8">
        <div className="grid gap-8 md:grid-cols-[1fr_280px]">
          {/* Main Habit Column */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                  Today's Rituals
                </h2>
                <p className="font-body text-xs text-muted-foreground">{todayStr}</p>
              </div>
              <Button
                onClick={() => setCreateHabitOpen(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Habit
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : habits && habits.length > 0 ? (
              <div className="grid gap-4">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    timezone={timezone}
                    onMilestoneCrossed={(milestone) => {
                      toast({
                        title: "Milestone Reached! 🎉",
                        description: `Streak reached ${milestone} days on "${habit.name}"!`,
                      });
                      // Phase 5 will add celebration overlay hook
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-white p-12 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground/60 mb-4">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-1.5">
                  No Habits Set Up
                </h3>
                <p className="font-body text-sm text-muted-foreground max-w-xs mb-6">
                  Set up your first daily ritual to start building consistency and growing your Streak Orb.
                </p>
                <Button
                  onClick={() => setCreateHabitOpen(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl"
                >
                  Create Your First Habit
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar Orb Column */}
          <div className="flex flex-col items-center gap-6 md:sticky md:top-24 md:h-fit">
            <div className="w-full rounded-2xl border border-border/80 bg-white p-6 shadow-sm flex flex-col items-center text-center">
              <h3 className="font-heading text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Streak Consistency
              </h3>
              
              {isLoading ? (
                <Skeleton className="h-48 w-48 rounded-full" />
              ) : (
                <div className="flex justify-center items-center h-48 w-48 mb-4">
                  <StreakOrb
                    strengthLevel={globalStats?.strengthLevel || 0}
                    maxStreak={globalStats?.maxStreak || 0}
                    activeHabitsCount={globalStats?.activeHabitsCount || 0}
                    visuals3dEnabled={profile?.visuals_3d_enabled ?? true}
                  />
                </div>
              )}

              <Separator className="my-4 bg-border/60" />

              <div className="w-full grid grid-cols-2 gap-4">
                <div className="text-center p-2 rounded-xl bg-muted/40">
                  <span className="block font-heading text-xl font-bold text-foreground">
                    {isLoading ? "-" : globalStats?.maxStreak || 0}
                  </span>
                  <span className="font-body text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Best Streak
                  </span>
                </div>
                <div className="text-center p-2 rounded-xl bg-muted/40">
                  <span className="block font-heading text-xl font-bold text-foreground">
                    {isLoading ? "-" : habits?.length || 0}
                  </span>
                  <span className="font-body text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Rituals
                  </span>
                </div>
              </div>

              {!isLoading && globalStats && globalStats.maxStreak >= 7 && (
                <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent/5 px-3 py-2 text-xs font-semibold text-accent text-left">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>Consistency is established! Keep going.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Habit Dialog Modal (Create/Edit) */}
      <HabitDialog />
    </div>
  );
}
