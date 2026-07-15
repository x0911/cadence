"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { resolveColor, type HabitColorToken } from "@/lib/palette";
import { Button } from "@/components/ui/button";
import { prefersReducedMotion } from "@/lib/device";
import { Play, Pause, RotateCcw, CheckCircle, ArrowRight, Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { useUIStore } from "@/store/ui-store";
import TiltedCard from "@/components/react-bits/components/TiltedCard";

interface FocusTimerProps {
  habitId: string;
  habitName: string;
  colorToken: string;
  durationSeconds: number;
  onComplete: (durationSeconds: number) => void;
}

export function FocusTimer({
  habitName,
  colorToken,
  durationSeconds,
  onComplete,
}: FocusTimerProps) {
  const colorHex = resolveColor(colorToken as HabitColorToken);
  const { showConfirm } = useUIStore();
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Sound configuration using Web Audio API (no external asset needed!)
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Node 1: Oscillator (Chime tone)
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      // E5 and G5 chords
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.15); // G5

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn("AudioContext chime block failed:", e);
    }
  }, [soundEnabled]);

  // Complete handler
  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    playChime();

    // Animate completion state header
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { scale: 0.9, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" }
      );
    }

    onComplete(durationSeconds);
  }, [playChime, onComplete, durationSeconds]);

  // Timer loop
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, handleTimerComplete]);

  // SVG ring stroke calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / durationSeconds) * circumference;

  // Animate SVG ring using GSAP if reduced motion is disabled
  useEffect(() => {
    if (ringRef.current && !prefersReducedMotion()) {
      gsap.to(ringRef.current, {
        strokeDashoffset,
        duration: 0.3,
        ease: "linear",
      });
    }
  }, [timeLeft, strokeDashoffset]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTimeLeft(durationSeconds);
  };

  const skipTimer = () => {
    showConfirm({
      title: "Skip Timer",
      description:
        "Are you sure you want to skip the rest of the timer and log this focus session immediately?",
      confirmLabel: "Skip & Log",
      cancelLabel: "Resume",
      onConfirm: () => {
        handleTimerComplete();
      },
    });
  };

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const timerCard = (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-6 text-center font-body shadow-sm">
      <div className="mb-4 flex w-full items-center justify-between">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Focus Session
        </h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="h-8 w-8 rounded-lg text-muted-foreground"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>

      <div className="relative mb-6 flex h-48 w-48 items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 190 190">
          <circle
            cx="95"
            cy="95"
            r={radius}
            className="stroke-muted"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            ref={ringRef}
            cx="95"
            cy="95"
            r={radius}
            stroke={colorHex}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={prefersReducedMotion() ? strokeDashoffset : undefined} // direct fallback
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Central Timer Text */}
        <div className="z-10 flex flex-col items-center justify-center">
          {isCompleted ? (
            <CheckCircle className="mb-1 h-10 w-10" style={{ color: colorHex }} />
          ) : (
            <span className="font-heading text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {formatTime(timeLeft)}
            </span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isCompleted ? "Session Done" : isActive ? "Focusing" : "Paused"}
          </span>
        </div>
      </div>

      <h3
        ref={titleRef}
        className="mb-6 max-w-[200px] font-heading text-lg font-bold text-foreground"
      >
        {isCompleted ? "Great Work!" : `Focusing on: ${habitName}`}
      </h3>

      <div className="flex items-center gap-3">
        {isCompleted ? (
          <Button
            onClick={resetTimer}
            className="flex items-center gap-1.5 rounded-xl bg-accent font-semibold text-accent-foreground"
          >
            <RotateCcw className="h-4.5 w-4.5" />
            <span>Restart Session</span>
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="h-11 w-11 rounded-xl border-border/80 hover:bg-muted"
            >
              <RotateCcw className="h-4.5 w-4.5 text-muted-foreground" />
            </Button>

            <Button
              onClick={toggleTimer}
              className="flex h-11 items-center gap-1.5 rounded-xl px-6 font-semibold text-white shadow-sm"
              style={{ backgroundColor: colorHex }}
            >
              {isActive ? (
                <>
                  <Pause className="h-4.5 w-4.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4.5 w-4.5 fill-current" />
                  <span>Start</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={skipTimer}
              className="h-11 w-11 rounded-xl border-border/80 hover:bg-muted"
              title="Skip to end"
            >
              <ArrowRight className="h-4.5 w-4.5 text-muted-foreground" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return !prefersReducedMotion() ? (
    <TiltedCard
      containerHeight="auto"
      containerWidth="100%"
      imageHeight="auto"
      imageWidth="100%"
      rotateAmplitude={6}
      scaleOnHover={1.01}
      showTooltip={false}
      enabledAnimation={false}
      showMobileWarning={false}
    >
      {timerCard}
    </TiltedCard>
  ) : (
    timerCard
  );
}
