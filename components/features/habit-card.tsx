"use client";

import { useRouter } from "next/navigation";
import { useStreakStats } from "@/hooks/useStreakStats";
import { CheckInButton } from "./check-in-button";
import { HabitIcon } from "@/components/ui/habit-icon";
import { resolveColor, type HabitColorToken } from "@/lib/palette";
import { StreakBadge } from "./streak-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArchiveHabit } from "@/hooks/useHabits";
import { useToast } from "@/hooks/use-toast";
import type { Habit } from "@/hooks/useHabits";

interface HabitCardProps {
  habit: Habit;
  timezone: string;
  onMilestoneCrossed?: (milestone: number) => void;
}

export function HabitCard({ habit, timezone, onMilestoneCrossed }: HabitCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { setEditingHabitId, setCreateHabitOpen, showConfirm } = useUIStore();
  const { mutate: archiveHabit } = useArchiveHabit();

  const { data: stats } = useStreakStats(habit.id, timezone);
  const colorHex = resolveColor(habit.color as HabitColorToken);

  // Check if checked in today
  const isCheckedInToday = stats
    ? stats.checkedInDates.includes(
        new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
          .format(new Date())
          .replace(/\//g, "-")
      )
    : false;

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid routing if interactive elements are clicked
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("[role='menuitem']")) {
      return;
    }
    router.push(`/habits/${habit.id}`);
  };

  const handleEdit = () => {
    setEditingHabitId(habit.id);
    setCreateHabitOpen(true);
  };

  const handleArchive = () => {
    showConfirm({
      title: "Archive Habit",
      description: `Are you sure you want to archive "${habit.name}"? This will soft-delete it from your active rituals list.`,
      confirmLabel: "Archive",
      cancelLabel: "Cancel",
      onConfirm: () => {
        archiveHabit(habit.id, {
          onSuccess: () => {
            toast({
              title: "Habit Archived",
              description: `"${habit.name}" has been soft-deleted.`,
            });
          },
        });
      },
    });
  };

  return (
    <Card
      onClick={handleCardClick}
      className="group relative cursor-pointer border-border/80 bg-card transition-all hover:shadow-md hover:border-accent/15 duration-200 rounded-2xl overflow-hidden"
    >
      {/* Decorative accent top border line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ backgroundColor: colorHex }}
      />

      <CardContent className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4 min-w-0">
          {/* Icon container */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-[1.03]"
            style={{
              backgroundColor: `${colorHex}12`, // 7% opacity
              color: colorHex,
            }}
          >
            <HabitIcon name={habit.icon} size={24} />
          </div>

          <div className="min-w-0 space-y-1">
            <h3 className="font-heading font-semibold text-base tracking-tight text-foreground truncate max-w-[160px] md:max-w-[240px]">
              {habit.name}
            </h3>
            
            <div className="flex items-center gap-2">
              <StreakBadge count={stats?.currentStreak || 0} />
              {habit.focus_mode && (
                <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-body text-[10px] font-medium text-muted-foreground">
                  ⏱️ Focus Mode
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CheckInButton
            habitId={habit.id}
            isCheckedInToday={isCheckedInToday}
            timezone={timezone}
            colorHex={colorHex}
            onCheckInCompleted={(_optimisticStreak) => {
              // Celebrate milestones if crossed
              if (onMilestoneCrossed && stats) {
                const prevStreak = stats.currentStreak;
                const newStreak = prevStreak + 1;
                const milestones = [7, 30, 100, 365];
                for (const m of milestones) {
                  if (prevStreak < m && newStreak >= m) {
                    onMilestoneCrossed(m);
                  }
                }
              }
            }}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-lg"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 font-body text-sm rounded-xl">
              <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2 cursor-pointer">
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive} className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer">
                <Trash2 className="h-4 w-4" />
                <span>Archive</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
