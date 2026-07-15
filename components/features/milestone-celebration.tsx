"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useUIStore, type CelebrationItem } from "@/store/ui-store";
import { resolveColor, type HabitColorToken } from "@/lib/palette";
import { prefersReducedMotion } from "@/lib/device";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, X } from "lucide-react";
import gsap from "gsap";
import Particles from "@/components/react-bits/backgrounds/Particles";
import ClickSpark from "@/components/react-bits/animations/ClickSpark";
import ShinyText from "@/components/react-bits/text/ShinyText";

export function MilestoneCelebration() {
  const { celebrationQueue, dequeueCelebration } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [activeItem, setActiveItem] = useState<CelebrationItem | null>(null);

  // Sync state with first item in queue
  useEffect(() => {
    if (celebrationQueue.length > 0) {
      setActiveItem(celebrationQueue[0]);
    } else {
      setActiveItem(null);
    }
  }, [celebrationQueue]);

  const handleClose = useCallback(() => {
    // Card exit animation
    if (cardRef.current && !prefersReducedMotion()) {
      gsap.to(cardRef.current, {
        scale: 0.9,
        opacity: 0,
        y: -20,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          dequeueCelebration();
        },
      });
    } else {
      dequeueCelebration();
    }
  }, [dequeueCelebration]);

  useEffect(() => {
    if (!activeItem) return;

    // Card entry animation
    if (cardRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.8, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" }
      );
    } else if (cardRef.current) {
      // Static fade-in for prefers-reduced-motion
      gsap.fromTo(cardRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }

    // Auto-dismiss after 6 seconds
    const timeout = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => clearTimeout(timeout);
  }, [activeItem, handleClose]);

  if (!activeItem) return null;

  const colorHex = resolveColor(activeItem.color as HabitColorToken);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 font-body"
    >
      {/* Dynamic particles background (respects prefers-reduced-motion) */}
      {!prefersReducedMotion() && (
        <div className="absolute inset-0 pointer-events-none -z-10">
          <Particles
            particleCount={45}
            particleSpread={10}
            speed={0.2}
            particleColors={[colorHex, "#34D399", "#059669", "#047857"]}
            particleBaseSize={110}
          />
        </div>
      )}

      {/* Burst-on-mount + responsive Click Spark wrapper */}
      {!prefersReducedMotion() ? (
        <ClickSpark
          sparkColor={colorHex}
          sparkCount={12}
          sparkRadius={28}
          duration={450}
          triggerOnMount={true}
        >
          <div className="flex h-full w-full items-center justify-center">
            {/* Celebration Card */}
            <div
              ref={cardRef}
              className="relative max-w-sm w-full bg-card border border-border/80 p-8 text-center rounded-3xl shadow-2xl flex flex-col items-center justify-center z-10"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <X className="h-4.5 w-4.5" />
                <span className="sr-only">Close</span>
              </button>

              {/* Icon / Trophy wrapper */}
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-md animate-bounce"
                style={{
                  backgroundColor: `${colorHex}15`,
                  color: colorHex,
                }}
              >
                <Trophy className="h-8 w-8 stroke-[2px]" />
              </div>

              <div className="flex items-center gap-1 bg-accent/5 px-2.5 py-1 rounded-full text-xs font-bold text-accent mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Milestone Reached!</span>
              </div>

              <h2 className="font-heading text-4xl font-black tracking-tight mb-2">
                <ShinyText
                  text={`${activeItem.milestoneValue} Day Streak!`}
                  color={colorHex}
                  shineColor="#ffffff"
                />
              </h2>

              <p className="text-sm text-muted-foreground mb-6 max-w-[260px] text-balance">
                Amazing consistency! You've checked in to{" "}
                <span className="font-semibold text-foreground">"{activeItem.habitName}"</span> for{" "}
                {activeItem.milestoneValue} consecutive intervals.
              </p>

              <Button
                onClick={handleClose}
                className="w-full font-semibold rounded-xl"
                style={{ backgroundColor: colorHex, color: "#FFFFFF" }}
              >
                Keep It Up
              </Button>
            </div>
          </div>
        </ClickSpark>
      ) : (
        /* Static view for prefersReducedMotion() */
        <div
          ref={cardRef}
          className="relative max-w-sm w-full bg-card border border-border/80 p-8 text-center rounded-3xl shadow-2xl flex flex-col items-center justify-center z-10"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <X className="h-4.5 w-4.5" />
            <span className="sr-only">Close</span>
          </button>

          {/* Icon / Trophy wrapper */}
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-md"
            style={{
              backgroundColor: `${colorHex}15`,
              color: colorHex,
            }}
          >
            <Trophy className="h-8 w-8 stroke-[2px]" />
          </div>

          <div className="flex items-center gap-1 bg-accent/5 px-2.5 py-1 rounded-full text-xs font-bold text-accent mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Milestone Reached!</span>
          </div>

          <h2 className="font-heading text-4xl font-black tracking-tight text-foreground mb-2">
            {activeItem.milestoneValue} Day Streak!
          </h2>

          <p className="text-sm text-muted-foreground mb-6 max-w-[260px] text-balance">
            Amazing consistency! You've checked in to{" "}
            <span className="font-semibold text-foreground">"{activeItem.habitName}"</span> for{" "}
            {activeItem.milestoneValue} consecutive intervals.
          </p>

          <Button
            onClick={handleClose}
            className="w-full font-semibold rounded-xl"
            style={{ backgroundColor: colorHex, color: "#FFFFFF" }}
          >
            Keep It Up
          </Button>
        </div>
      )}
    </div>
  );
}
