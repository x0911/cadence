/**
 * components/features/habit-card.tsx — stub for Phase 3
 */
"use client";

export interface HabitCardProps {
  habitId: string;
  name: string;
  icon: string;
  color: string;
  currentStreak: number;
  isCheckedInToday: boolean;
}

export function HabitCard({
  name,
  currentStreak,
  isCheckedInToday,
}: HabitCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="font-heading font-semibold text-foreground">{name}</h3>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        Streak: {currentStreak} · {isCheckedInToday ? "✓ Done today" : "Not yet"}
      </p>
    </div>
  );
}
