"use client";

import { useArchivedHabits, useRestoreHabit } from "@/hooks/useHabits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RotateCcw, Calendar, Loader2, Inbox } from "lucide-react";
import Link from "next/link";

export default function ArchivedHabitsPage() {
  const { toast } = useToast();
  const { data: archivedHabits, isLoading } = useArchivedHabits();
  const { mutate: restoreHabit, isPending: isRestoring } = useRestoreHabit();

  const handleRestore = (id: string, name: string) => {
    restoreHabit(id, {
      onSuccess: () => {
        toast({
          title: "Ritual Restored",
          description: `"${name}" has been successfully added back to your active rituals list.`,
        });
      },
      onError: (err: any) => {
        toast({
          title: "Restore Failed",
          description: err.message || "Failed to restore ritual.",
          variant: "destructive",
        });
      },
    });
  };

  const formatArchivedDate = (dateStr: string | null) => {
    if (!dateStr) return "Unknown date";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16 font-body">
      {/* Archived Navigation Header */}
      <header className="border-border/80 sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
          </Link>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            Archived Rituals
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              History
            </h2>
            <p className="text-xs text-muted-foreground">
              Review and restore your past rituals and completion logs.
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-border bg-white p-8 shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="mt-2 text-sm text-muted-foreground">Loading archives...</span>
            </div>
          ) : archivedHabits && archivedHabits.length > 0 ? (
            <div className="grid gap-4">
              {archivedHabits.map((habit) => (
                <Card key={habit.id} className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="font-heading text-lg font-bold tracking-tight text-foreground">
                          {habit.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {habit.focus_mode
                            ? `⏱️ Focus Mode Enabled (${
                                habit.focus_duration_seconds
                                  ? Math.round(habit.focus_duration_seconds / 60)
                                  : 25
                              }m)`
                            : "Standard logging"}
                        </CardDescription>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {habit.frequency}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between gap-4 border-t border-border/40 p-5 pt-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Archived on {formatArchivedDate(habit.archived_at)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(habit.id, habit.name)}
                      disabled={isRestoring}
                      className="border-border/85 hover:bg-accent/5 rounded-xl text-xs font-semibold hover:text-accent hover:border-accent/40"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Restore Ritual
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border-border/80 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white p-12 text-center shadow-sm">
              <div className="text-muted-foreground/60 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Inbox className="h-7 w-7" />
              </div>
              <h3 className="mb-1.5 font-heading text-lg font-semibold text-foreground">
                No Archived Rituals
              </h3>
              <p className="max-w-xs text-xs text-muted-foreground">
                When you archive a habit, it will appear here so you can retrieve it later with all its consistency history preserved.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
