"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useUIStore, type CelebrationItem } from "@/store/ui-store";
import { resolveColor, type HabitColorToken } from "@/lib/palette";
import { prefersReducedMotion } from "@/lib/device";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, X } from "lucide-react";
import gsap from "gsap";

export function MilestoneCelebration() {
  const { celebrationQueue, dequeueCelebration } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);

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

    // 1. Staggered card entry animation
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

    // 2. Confetti DOM Particle Burst (Only if prefers-reduced-motion is disabled)
    if (!prefersReducedMotion() && particleContainerRef.current) {
      const container = particleContainerRef.current;
      container.innerHTML = ""; // Clear existing

      const particleCount = 60;
      const colors = ["#059669", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
      const brandColor = resolveColor(activeItem.color as HabitColorToken);
      colors.push(brandColor); // Add habit's specific accent color to the mix

      const particles: HTMLDivElement[] = [];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "absolute rounded-sm pointer-events-none";
        
        // Random dimensions
        const width = gsap.utils.random(8, 14);
        const height = gsap.utils.random(8, 14);
        
        // Apply styling
        particle.style.width = `${width}px`;
        particle.style.height = `${height}px`;
        particle.style.backgroundColor = gsap.utils.random(colors);
        particle.style.borderRadius = gsap.utils.random([0, 2, 9999]) + "px"; // Squares, rounded squares, circles
        
        // Set initial scatter position in the center
        particle.style.left = "50%";
        particle.style.top = "50%";
        particle.style.transform = "translate(-50%, -50%)";

        container.appendChild(particle);
        particles.push(particle);
      }

      // Animate particles outward
      particles.forEach((p) => {
        const angle = gsap.utils.random(0, 360) * (Math.PI / 180);
        const velocity = gsap.utils.random(100, 350);
        
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity - gsap.utils.random(50, 150); // Gravity upward force bias

        gsap.to(p, {
          x: targetX,
          y: targetY,
          rotation: gsap.utils.random(-720, 720),
          duration: gsap.utils.random(1.2, 2.2),
          ease: "power2.out",
        });

        // Add downward fall gravity + fade out
        gsap.to(p, {
          y: targetY + 300, // Fall down
          opacity: 0,
          scale: 0.2,
          delay: 0.4,
          duration: gsap.utils.random(1.0, 1.8),
          ease: "power1.in",
        });
      });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-body"
    >
      {/* Particle overlay container */}
      <div ref={particleContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />

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
    </div>
  );
}
