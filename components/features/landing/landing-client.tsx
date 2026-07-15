"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Flame,
  PlusCircle,
  CalendarCheck2,
  TrendingUp,
  Sparkles,
  Zap,
  ShieldAlert,
  Volume2,
  Play,
  Trophy,
} from "lucide-react";
import { prefersReducedMotion, isLowEndDevice } from "@/lib/device";
import { StreakOrb } from "@/components/features/streak-orb/streak-orb";
import StarBorder from "@/components/react-bits/components/StarBorder";

// Dynamically import heavy canvas/animation libraries with ssr: false to optimize LCP
const Aurora = dynamic(() => import("@/components/react-bits/backgrounds/Aurora"), { ssr: false });
const Particles = dynamic(() => import("@/components/react-bits/backgrounds/Particles"), {
  ssr: false,
});
const SplitText = dynamic(() => import("@/components/react-bits/text/SplitText"), { ssr: false });
const BlurText = dynamic(() => import("@/components/react-bits/text/BlurText"), { ssr: false });
const ShinyText = dynamic(() => import("@/components/react-bits/text/ShinyText"), { ssr: false });
const DecryptedText = dynamic(() => import("@/components/react-bits/text/DecryptedText"), {
  ssr: false,
});
const GradientText = dynamic(() => import("@/components/react-bits/text/GradientText"), {
  ssr: false,
});
const ClickSpark = dynamic(() => import("@/components/react-bits/animations/ClickSpark"), {
  ssr: false,
});
const SpotlightCard = dynamic(() => import("@/components/react-bits/components/SpotlightCard"), {
  ssr: false,
});
const CountUp = dynamic(() => import("@/components/react-bits/text/CountUp"), { ssr: false });

/**
 * 1. HERO SECTION CLIENT LEAF
 */
export function HeroClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const showEffects = mounted && !prefersReducedMotion();
  const showBackground = showEffects && !isLowEndDevice();

  return (
    <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      {/* Background Aurora */}
      {showBackground && (
        <div
          className="absolute inset-0 -z-20 opacity-75"
          style={{
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        >
          <Aurora amplitude={0.5} speed={0.3} />
        </div>
      )}
      {/* Static blur fallback behind text if no background animation */}
      {!showBackground && (
        <div className="absolute inset-0 -z-20 overflow-hidden opacity-30">
          <div className="absolute -left-[10%] -top-[20%] h-[60%] w-[50%] rounded-full bg-accent/10 blur-[140px]" />
          <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-accent/10 blur-[140px]" />
        </div>
      )}

      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-12 md:flex-row md:text-left">
        {/* Left Text content */}
        <div className="flex max-w-xl flex-col items-center space-y-6 md:items-start">
          <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 font-body text-xs font-bold text-accent shadow-sm">
            <Flame className="h-3.5 w-3.5" />
            <span>Consistency, Beautifully Tracked</span>
          </div>

          {showEffects ? (
            <SplitText
              text="Your habits are growing."
              className="font-heading text-4xl font-extrabold !leading-[1.21] text-foreground sm:text-5xl md:text-6xl"
              delay={80}
              threshold={0.15}
              rootMargin="-10%"
              textAlign="left"
            />
          ) : (
            <h1 className="font-heading text-4xl font-extrabold !leading-tight text-foreground sm:text-5xl md:text-6xl">
              Your habits are growing.
            </h1>
          )}

          {showEffects ? (
            <BlurText
              text="Cadence turns habit-building into a clean, game-like experience. Establish daily rituals, maintain streaks, and watch your 3D progress orb grow."
              className="max-w-md font-body text-base text-muted-foreground sm:text-lg"
              delay={25}
              animateBy="words"
            />
          ) : (
            <p className="max-w-md font-body text-base text-muted-foreground sm:text-lg">
              Cadence turns habit-building into a clean, game-like experience. Establish daily
              rituals, maintain streaks, and watch your 3D progress orb grow.
            </p>
          )}

          <div className="pt-2">
            <StarBorder
              as="a"
              href="/login"
              thickness={1.5}
              color="rgb(var(--color-accent))"
              innerClassName="bg-accent hover:bg-accent/95 hover:text-accent-foreground px-8 py-3 rounded-[20px] transition-colors font-body font-semibold text-accent-foreground shadow-glow inline-block"
            >
              Start Your Streak Free →
            </StarBorder>
          </div>
        </div>

        {/* Right Streak Orb Visual (level 2 established) */}
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-border/30 bg-card/10 p-8 shadow-2xl shadow-black/[0.03] backdrop-blur-sm">
            <StreakOrb strengthLevel={2} maxStreak={12} activeHabitsCount={3} />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 2. HOW IT WORKS CLIENT LEAF
 */
export function HowItWorksClient() {
  const steps = [
    {
      icon: <PlusCircle className="h-6 w-6 text-accent" />,
      title: "1. Create Your Ritual",
      desc: "Define daily habits that matter to you. Choose colors, set focus modes, and specify active days.",
    },
    {
      icon: <CalendarCheck2 className="h-6 w-6 text-accent" />,
      title: "2. Log Daily Check-ins",
      desc: "Check in to your rituals daily. Each completion reinforces your commitment and updates your live metrics.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-accent" />,
      title: "3. Watch the Orb Evolve",
      desc: "Your global Streak Orb scales and glows in 3D based on your consistency level. Guard against breaking streaks.",
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-20 font-body">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
          Build Consistency in 3 Simple Steps
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          No complex workflows, no visual noise. Just clear habit formation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, idx) => (
          <SpotlightCard
            key={idx}
            className="flex flex-col items-center gap-4 rounded-2xl border border-border/80 bg-card p-8 text-center md:items-start md:text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
              {step.icon}
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">{step.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}

/**
 * 3. ORB SHOWCASE CLIENT LEAF
 */
export function OrbShowcaseClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const showEffects = mounted && !prefersReducedMotion();

  return (
    <section className="border-y border-border/60 bg-muted/30 py-20 font-body">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-12 px-4 md:flex-row">
        {/* Left 3D Orb (level 3 strong) */}
        <div className="order-2 flex shrink-0 flex-col items-center justify-center md:order-1">
          <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-border/30 bg-card/25 p-8 shadow-2xl backdrop-blur-sm">
            <StreakOrb strengthLevel={3} maxStreak={42} activeHabitsCount={5} />
          </div>
        </div>

        {/* Right Info */}
        <div className="order-1 flex max-w-xl flex-col items-center space-y-6 text-center md:order-2 md:items-start md:text-left">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            Meet the Streak Orb
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            The core visual heart of Cadence. A real-time 3D particle sphere that represents the
            momentum of all your habits combined.
          </p>

          <div className="w-full space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="font-heading text-sm font-bold text-foreground">
                  {showEffects ? (
                    <DecryptedText text="Grows With Consistency" speed={50} animateOn="view" />
                  ) : (
                    "Grows With Consistency"
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  4 visual strength levels: Dormant (slate), Building (soft green), Established
                  (emerald), and Strong (deep emerald).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Zap className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="font-heading text-sm font-bold text-foreground">
                  {showEffects ? (
                    <DecryptedText text="Full 3D, High Performance" speed={50} animateOn="view" />
                  ) : (
                    "Full 3D, High Performance"
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Powered by Three.js with hardware-concurrency checking and automatic fallback to
                  static SVGs on low-end devices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="font-heading text-sm font-bold text-foreground">
                  {showEffects ? (
                    <DecryptedText text="A Visual Commit" speed={50} animateOn="view" />
                  ) : (
                    "A Visual Commit"
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Breaking a streak causes the orb to decay in size and color stops. The visual
                  motivation keeps you logging day-to-day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 4. STATS SHOWCASE CLIENT LEAF
 */
export function StatsShowcaseClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const showEffects = mounted && !prefersReducedMotion();

  // Illustrative Heatmap data (6 months)
  const columns = Array.from({ length: 24 }, (_, colIdx) => {
    return Array.from({ length: 7 }, (_, rowIdx) => {
      const rand = Math.sin(colIdx * 1.5 + rowIdx * 0.7);
      const isChecked = rand > -0.25;
      return { isChecked, opacity: isChecked ? 0.3 + (colIdx % 4) * 0.2 : 0 };
    });
  });

  return (
    <section className="mx-auto max-w-5xl px-4 py-20 font-body">
      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* Left Info & CountUps */}
        <div className="space-y-6 text-center md:text-left">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            Consistency Map & Metrics
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Track your journey with pixel-perfect heatmaps that show your check-in logs over the
            past 6 months. Watch your numbers climb as you maintain momentum.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center">
              <span className="block font-heading text-3xl font-extrabold text-accent">
                {showEffects ? <CountUp to={182} from={0} duration={1.2} /> : "182"}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Check-ins
              </span>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center">
              <span className="block font-heading text-3xl font-extrabold text-accent">
                {showEffects ? <CountUp to={42} from={0} duration={1.2} /> : "42"}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Current Streak
              </span>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/50 p-4 text-center">
              <span className="block font-heading text-3xl font-extrabold text-accent">
                {showEffects ? <CountUp to={96} from={0} duration={1.2} suffix="%" /> : "96%"}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Success Rate
              </span>
            </div>
          </div>
        </div>

        {/* Right illustrative Heatmap card */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h4 className="font-heading text-sm font-bold text-foreground">Consistency Map</h4>
              <p className="text-[10px] text-muted-foreground">
                Mock tracking logs for "Hydration"
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="h-2.5 w-2.5 rounded-sm bg-muted" />
              <div className="h-2.5 w-2.5 rounded-sm bg-accent/30" />
              <div className="h-2.5 w-2.5 rounded-sm bg-accent/60" />
              <div className="h-2.5 w-2.5 rounded-sm bg-accent" />
              <span>More</span>
            </div>
          </div>

          <div className="flex justify-center gap-1 overflow-x-auto pb-1">
            {columns.map((column, colIdx) => (
              <div key={colIdx} className="flex shrink-0 flex-col gap-1">
                {column.map((cell, rowIdx) => (
                  <div
                    key={`${colIdx}-${rowIdx}`}
                    className={`h-2.5 w-2.5 rounded-[2px]`}
                    style={{
                      backgroundColor: cell.isChecked ? "rgb(var(--color-accent))" : undefined,
                      opacity: cell.isChecked ? cell.opacity : undefined,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 5. TIMER SHOWCASE CLIENT LEAF
 */
export function TimerShowcaseClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const showEffects = mounted && !prefersReducedMotion();

  return (
    <section className="border-y border-border/60 bg-muted/30 py-20 font-body">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-12 px-4 md:flex-row-reverse">
        {/* Right Info */}
        <div className="flex max-w-xl flex-col items-center space-y-6 text-center md:items-start md:text-left">
          <div className="inline-block">
            {showEffects ? (
              <GradientText
                colors={["#34D399", "#10B981", "#059669", "#047857", "#34D399"]}
                animationSpeed={6}
                showBorder={false}
                className="font-heading text-sm font-bold uppercase tracking-widest text-accent"
              >
                Deep Focus Sessions
              </GradientText>
            ) : (
              <span className="font-heading text-sm font-bold uppercase tracking-widest text-accent">
                Deep Focus Sessions
              </span>
            )}
          </div>

          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            Block Out Noise, Build Habit Rituals
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Need dedicated time to study, write, or meditate? Activate deep focus timers straight
            from your habit cards. A clean SVG circular ring counts down, playing soft chords when
            finished to celebrate.
          </p>
        </div>

        {/* Left Timer Mock Card */}
        <div className="flex w-full max-w-xs flex-col items-center rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xl">
          <div className="mb-4 flex w-full items-center justify-between">
            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Focus Session
            </span>
            <Volume2 className="h-4.5 w-4.5 text-muted-foreground/60" />
          </div>

          <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="68"
                className="stroke-muted"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                className="stroke-accent transition-all duration-300"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="427"
                strokeDashoffset="120"
                strokeLinecap="round"
              />
            </svg>
            <div className="z-10 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-bold tabular-nums text-foreground">
                18:45
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Focusing
              </span>
            </div>
          </div>

          <h4 className="mb-4 font-heading text-sm font-bold text-foreground">
            Focusing on: Coding Ritual
          </h4>

          <div className="flex gap-2">
            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-muted hover:bg-muted/80">
              <div className="h-3 w-3 rounded-sm bg-foreground" />
            </div>
            <div className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground text-white hover:opacity-90">
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Pause</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 6. MILESTONES & CELEBRATIONS CLIENT LEAF
 */
export function MilestoneShowcaseClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const showParticles = isInView && !prefersReducedMotion();

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center justify-center overflow-hidden py-20 font-body"
    >
      {/* Background Particles (only active when in view) */}
      {showParticles && (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
          <Particles
            particleCount={35}
            particleSpread={10}
            speed={0.12}
            particleColors={["#34D399", "#059669", "#047857", "#EF4444", "#F59E0B"]}
            particleBaseSize={100}
          />
        </div>
      )}

      <div className="mb-12 max-w-xl px-4 text-center">
        <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
          Celebrate Every Milestone
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Consistency is hard. Cadence rewards your discipline with color bursts and animated
          celebration screens when you hit streak milestones.
        </p>
      </div>

      {/* Replay Card */}
      {showParticles ? (
        <ClickSpark
          sparkColor="#34D399"
          sparkCount={12}
          sparkRadius={26}
          duration={500}
          triggerOnMount={true}
        >
          <div className="flex h-full w-full items-center justify-center px-4">
            <CelebrationCard />
          </div>
        </ClickSpark>
      ) : (
        <div className="flex h-full w-full items-center justify-center px-4">
          <CelebrationCard />
        </div>
      )}
    </section>
  );
}

function CelebrationCard() {
  return (
    <div className="relative z-10 flex w-full max-w-sm flex-col items-center justify-center rounded-3xl border border-border/80 bg-card p-8 text-center shadow-2xl">
      <div className="mb-5 flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-sm">
        <Trophy className="h-7 w-7" />
      </div>

      <div className="mb-3 flex items-center gap-1 rounded-full bg-accent/5 px-2.5 py-1 text-xs font-bold text-accent">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Milestone Reached!</span>
      </div>

      <h3 className="mb-2 font-heading text-3xl font-black tracking-tight">
        <ShinyText text="30 Day Streak!" color="#10B981" shineColor="#ffffff" />
      </h3>

      <p className="mb-4 max-w-[260px] text-balance text-xs text-muted-foreground">
        Amazing consistency! You've checked in to your habit for 30 consecutive intervals.
      </p>
    </div>
  );
}

/**
 * 7. FINAL CTA CLIENT LEAF
 */
export function FinalCtaClient() {
  return (
    <div className="pt-2">
      <StarBorder
        as="a"
        href="/login"
        thickness={1.5}
        color="rgb(var(--color-accent))"
        innerClassName="bg-accent hover:bg-accent/95 hover:text-accent-foreground px-8 py-3 rounded-[20px] transition-colors font-body font-semibold text-accent-foreground shadow-glow inline-block"
      >
        Start Your Streak Free
      </StarBorder>
    </div>
  );
}
