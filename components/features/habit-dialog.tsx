"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/ui-store";
import { useCreateHabit, useUpdateHabit, useHabit } from "@/hooks/useHabits";
import { HABIT_COLORS, HABIT_ICONS, resolveColor } from "@/lib/palette";
import { HabitIcon } from "@/components/ui/habit-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HabitDialog() {
  const { toast } = useToast();
  const { isCreateHabitOpen, setCreateHabitOpen, editingHabitId, setEditingHabitId } = useUIStore();

  const { data: editingHabit, isLoading: isHabitLoading } = useHabit(editingHabitId || "");
  const { mutate: createHabit, isPending: isCreatePending } = useCreateHabit();
  const { mutate: updateHabit, isPending: isUpdatePending } = useUpdateHabit();

  // Form State
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("Star");
  const [selectedColor, setSelectedColor] = useState<string>("green-1");
  const [frequency, setFrequency] = useState<string>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [focusDuration, setFocusDuration] = useState("1800"); // Default 30 mins (1800s)

  // Sync Form State with editing habit
  useEffect(() => {
    if (editingHabitId && editingHabit) {
      setName(editingHabit.name);
      setSelectedIcon(editingHabit.icon);
      setSelectedColor(editingHabit.color);
      setFrequency(editingHabit.frequency);
      setCustomDays(editingHabit.custom_days || []);
      setFocusMode(editingHabit.focus_mode);
      setFocusDuration(String(editingHabit.focus_duration_seconds || 1800));
    } else if (!editingHabitId) {
      // Reset to defaults
      setName("");
      setSelectedIcon("Star");
      setSelectedColor("green-1");
      setFrequency("daily");
      setCustomDays([]);
      setFocusMode(false);
      setFocusDuration("1800");
    }
  }, [editingHabit, editingHabitId]);

  const handleDayToggle = (dayIndex: number) => {
    setCustomDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleClose = () => {
    setCreateHabitOpen(false);
    setEditingHabitId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the habit.",
        variant: "destructive",
      });
      return;
    }

    if (frequency === "custom" && customDays.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one day for custom frequency.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      frequency,
      custom_days: frequency === "custom" ? customDays : null,
      focus_mode: focusMode,
      focus_duration_seconds: focusMode ? Number(focusDuration) : null,
    };

    if (editingHabitId) {
      // Update Mode
      updateHabit(
        { id: editingHabitId, ...payload },
        {
          onSuccess: () => {
            toast({
              title: "Habit Updated",
              description: `"${name}" has been successfully updated.`,
            });
            handleClose();
          },
          onError: (err) => {
            toast({
              title: "Update Failed",
              description: err.message,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create Mode
      createHabit(payload, {
        onSuccess: () => {
          toast({
            title: "Habit Created!",
            description: `"${name}" has been successfully added.`,
          });
          handleClose();
        },
        onError: (err) => {
          toast({
            title: "Creation Failed",
            description: err.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  const isPending = isCreatePending || isUpdatePending;

  return (
    <Dialog open={isCreateHabitOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md w-full bg-card border-border sm:rounded-2xl rounded-t-2xl font-body max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold tracking-tight">
            {editingHabitId ? "Edit Habit" : "Create New Habit"}
          </DialogTitle>
          <DialogDescription>
            {editingHabitId
              ? "Update details of your habit below."
              : "Set up a new habit to start building consistency."}
          </DialogDescription>
        </DialogHeader>

        {editingHabitId && isHabitLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Habit Name */}
            <div className="space-y-2">
              <Label htmlFor="habit-name" className="text-xs font-semibold text-foreground">
                Habit Name
              </Label>
              <Input
                id="habit-name"
                placeholder="e.g. Write 500 words, Drink Water"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
                maxLength={45}
                className="font-body text-sm rounded-xl border-border/80"
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground block mb-1">
                Select Icon
              </Label>
              <div className="grid grid-cols-5 gap-2 max-h-[140px] overflow-y-auto p-1.5 border border-border/60 rounded-xl bg-muted/30">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    disabled={isPending}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-xl border transition-all duration-150 hover:bg-muted active:scale-95",
                      selectedIcon === icon
                        ? "border-accent bg-accent/5 text-accent shadow-sm"
                        : "border-border/40 bg-card text-muted-foreground"
                    )}
                  >
                    <HabitIcon name={icon} size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground block mb-1">
                Select Color Accent
              </Label>
              <div className="flex flex-wrap gap-2.5 p-1">
                {HABIT_COLORS.map((color) => {
                  const colorHex = resolveColor(color.token);
                  return (
                    <button
                      key={color.token}
                      type="button"
                      onClick={() => setSelectedColor(color.token)}
                      disabled={isPending}
                      className={cn(
                        "h-7 w-7 rounded-full transition-all flex items-center justify-center border-2",
                        selectedColor === color.token
                          ? "border-foreground scale-110 shadow-sm"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: colorHex }}
                      title={color.label}
                    >
                      {selectedColor === color.token && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frequency Selection */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-xs font-semibold text-foreground">
                  Frequency
                </Label>
                <UISelect value={frequency} onValueChange={setFrequency} disabled={isPending}>
                  <SelectTrigger id="frequency" className="rounded-xl border-border/80">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-body">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom Days</SelectItem>
                  </SelectContent>
                </UISelect>
              </div>

              {frequency === "custom" && (
                <div className="space-y-2 animate-fade-up">
                  <Label className="text-xs font-semibold text-foreground block">
                    Choose Days
                  </Label>
                  <div className="flex gap-1.5 justify-between">
                    {WEEKDAYS.map((day, idx) => {
                      const isSelected = customDays.includes(idx);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(idx)}
                          disabled={isPending}
                          className={cn(
                            "flex-1 py-2 text-xs font-semibold rounded-lg border transition-all",
                            isSelected
                              ? "bg-accent/10 border-accent/40 text-accent"
                              : "border-border/60 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Focus Mode Switch */}
            <div className="flex items-center justify-between border-t border-border/55 pt-4">
              <div className="space-y-0.5">
                <Label htmlFor="focus-mode" className="text-sm font-semibold text-foreground">
                  Focus Timer Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable a focus countdown timer for this habit.
                </p>
              </div>
              <Switch
                id="focus-mode"
                checked={focusMode}
                onCheckedChange={setFocusMode}
                disabled={isPending}
              />
            </div>

            {focusMode && (
              <div className="space-y-2 animate-fade-up">
                <Label htmlFor="focus-duration" className="text-xs font-semibold text-foreground">
                  Timer Duration
                </Label>
                <UISelect value={focusDuration} onValueChange={setFocusDuration} disabled={isPending}>
                  <SelectTrigger id="focus-duration" className="rounded-xl border-border/80">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-body">
                    <SelectItem value="300">5 Minutes</SelectItem>
                    <SelectItem value="600">10 Minutes</SelectItem>
                    <SelectItem value="900">15 Minutes</SelectItem>
                    <SelectItem value="1500">25 Minutes</SelectItem>
                    <SelectItem value="1800">30 Minutes</SelectItem>
                    <SelectItem value="2700">45 Minutes</SelectItem>
                    <SelectItem value="3600">60 Minutes</SelectItem>
                  </SelectContent>
                </UISelect>
              </div>
            )}

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                className="font-semibold rounded-xl border-border/80 hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingHabitId ? (
                  "Save Changes"
                ) : (
                  "Create Habit"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
