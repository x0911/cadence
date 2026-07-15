"use client";

import { useHabit } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";
import { useStreakStats } from "@/hooks/useStreakStats";
import { useCheckIn } from "@/hooks/useCheckIn";
import { HeatmapCalendar } from "@/components/features/heatmap-calendar";
import { FocusTimer } from "@/components/features/focus-timer";
import { HabitIcon } from "@/components/ui/habit-icon";
import { resolveColor, type HabitColorToken } from "@/lib/palette";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit2, Award, Flame, Target, CheckCircle2 } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export default function HabitDetailPage({ params }: PageProps) {
  const { toast } = useToast();
  const { setEditingHabitId, setCreateHabitOpen } = useUIStore();

  const { id: habitId } = params;

  const { data: profile } = useProfile();
  const { data: habit, isLoading: isHabitLoading } = useHabit(habitId);
  
  const timezone = profile?.timezone || "UTC";
  const { data: stats, isLoading: isStatsLoading } = useStreakStats(habitId, timezone);

  const { mutate: logCheckIn } = useCheckIn(habitId, timezone);

  const colorHex = habit ? resolveColor(habit.color as HabitColorToken) : "#059669";

  const handleEdit = () => {
    if (habit) {
      setEditingHabitId(habit.id);
      setCreateHabitOpen(true);
    }
  };

  const handleFocusTimerComplete = (durationSeconds: number) => {
    // Check if already checked in today
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date())
      .replace(/\//g, "-");

    const isAlreadyCheckedIn = stats?.checkedInDates.includes(today);

    // Call check-in mutation, persisting focus duration
    logCheckIn(
      {
        isCheckedIn: !!isAlreadyCheckedIn, // if checked in, it toggles, but here we enforce check-in log
        focusDurationSeconds: durationSeconds,
      },
      {
        onSuccess: () => {
          toast({
            title: "Ritual Completed!",
            description: `Session logged for "${habit?.name}"!`,
          });
        },
      }
    );
  };

  const isLoading = isHabitLoading || isStatsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pb-16">
        <header className="border-b border-border/80 bg-white/80 backdrop-blur-md py-4 px-4">
          <div className="mx-auto max-w-4xl flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 pt-8 space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Habit Not Found</h2>
        <p className="font-body text-muted-foreground mb-6">This habit may have been archived or doesn't exist.</p>
        <Link href="/dashboard">
          <Button className="bg-accent text-accent-foreground font-semibold rounded-xl">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      {/* Detail header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            
            <Separator orientation="vertical" className="h-5 bg-border/60" />
            
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${colorHex}12`,
                  color: colorHex,
                }}
              >
                <HabitIcon name={habit.icon} size={20} />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                {habit.name}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="font-body font-semibold border-border/80 hover:bg-muted rounded-xl flex items-center gap-1.5"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Ritual</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-8">
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          {/* Left Column: Heatmap and Stats */}
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border/80 bg-white p-5 shadow-sm">
              <div className="text-center space-y-1">
                <span className="block font-heading text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5 text-accent animate-pulse" />
                  {stats?.currentStreak || 0}
                </span>
                <span className="block font-body text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Streak
                </span>
              </div>
              
              <div className="text-center space-y-1 border-x border-border/60">
                <span className="block font-heading text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                  <Award className="h-5 w-5 text-amber-500" />
                  {stats?.longestStreak || 0}
                </span>
                <span className="block font-body text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Longest Streak
                </span>
              </div>

              <div className="text-center space-y-1">
                <span className="block font-heading text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  {stats?.totalCheckIns || 0}
                </span>
                <span className="block font-body text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Taps
                </span>
              </div>
            </div>

            {/* Heatmap Calendar */}
            <HeatmapCalendar
              checkedInDates={stats?.checkedInDates || []}
              colorToken={habit.color}
              timezone={timezone}
            />
          </div>

          {/* Right Column: Focus Timer */}
          <div className="space-y-6">
            {habit.focus_mode ? (
              <FocusTimer
                habitId={habit.id}
                habitName={habit.name}
                colorToken={habit.color}
                durationSeconds={habit.focus_duration_seconds || 1800}
                onComplete={handleFocusTimerComplete}
              />
            ) : (
              <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center py-10">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/60 mb-3">
                  <Target className="h-6 w-6" />
                </div>
                <h4 className="font-heading text-sm font-semibold text-foreground mb-1">
                  Standard Habit
                </h4>
                <p className="font-body text-xs text-muted-foreground max-w-[200px]">
                  Focus mode countdown timer is not enabled for this habit. Edit the habit configuration to enable it.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
