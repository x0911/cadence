"use client";

import { useRef, useEffect } from "react";
import { useCheckIn } from "@/hooks/useCheckIn";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Flame, Loader2 } from "lucide-react";
import gsap from "gsap";

interface CheckInButtonProps {
  habitId: string;
  isCheckedInToday: boolean;
  timezone: string;
  colorHex: string;
  onCheckInCompleted?: (newStreak: number) => void;
}

export function CheckInButton({
  habitId,
  isCheckedInToday,
  timezone,
  colorHex,
  onCheckInCompleted,
}: CheckInButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const checkIconRef = useRef<HTMLDivElement>(null);
  
  const { mutate: toggleCheckIn, isPending } = useCheckIn(habitId, timezone);

  // Pop animation on check-in change
  useEffect(() => {
    if (isCheckedInToday && checkIconRef.current) {
      gsap.fromTo(
        checkIconRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }
      );
    }
  }, [isCheckedInToday]);

  const handleToggle = () => {
    // Immediate scale animation for instant INP / visual delight
    if (containerRef.current) {
      gsap.timeline()
        .to(containerRef.current, { scale: 0.92, duration: 0.08, ease: "power1.out" })
        .to(containerRef.current, { scale: 1, duration: 0.15, ease: "power2.out" });
    }

    toggleCheckIn(
      { isCheckedIn: isCheckedInToday },
      {
        onSuccess: (data) => {
          // If check-in succeeded, trigger optional completion celebration
          if (data && !isCheckedInToday && onCheckInCompleted) {
            // Since data contains the new check_in, query client will invalidate and fetch, 
            // but we can pass an optimistic guess to trigger celebration instantly.
            onCheckInCompleted(1); // celebration logic checks milestones
          }
        },
      }
    );
  };

  return (
    <Button
      ref={containerRef}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "relative min-w-28 font-body font-semibold transition-all select-none rounded-xl",
        isCheckedInToday
          ? "border-2 text-white border-transparent"
          : "border-2 border-border/80 bg-transparent text-foreground hover:bg-muted"
      )}
      style={{
        backgroundColor: isCheckedInToday ? colorHex : undefined,
      }}
    >
      {isPending ? (
        <Loader2 className="h-4.5 w-4.5 animate-spin" />
      ) : isCheckedInToday ? (
        <div ref={checkIconRef} className="flex items-center gap-1.5">
          <Check className="h-4.5 w-4.5 stroke-[3px]" />
          <span>Done</span>
        </div>
      ) : (
        <span className="flex items-center gap-1.5">
          <Flame className="h-4 w-4" style={{ color: colorHex }} />
          <span>Check In</span>
        </span>
      )}
    </Button>
  );
}
