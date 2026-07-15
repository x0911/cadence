import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Flame } from "lucide-react";
import { LandingHeader } from "@/components/features/landing/landing-header";

export const metadata: Metadata = {
  title: "Cadence — Build Habits That Last",
  description:
    "Cadence turns habit-building into a game. Track streaks, watch your 3D orb grow, and celebrate milestones. Start your first habit in seconds.",
};

// Dynamic imports for the interactive client sections to maintain LCP performance and zero SSR bundle bloat
const HeroClient = dynamic(
  () => import("@/components/features/landing/landing-client").then((m) => m.HeroClient),
  {
    ssr: true,
  }
);
const HowItWorksClient = dynamic(
  () => import("@/components/features/landing/landing-client").then((m) => m.HowItWorksClient),
  {
    ssr: true,
  }
);
const OrbShowcaseClient = dynamic(
  () => import("@/components/features/landing/landing-client").then((m) => m.OrbShowcaseClient),
  {
    ssr: true,
  }
);
const StatsShowcaseClient = dynamic(
  () => import("@/components/features/landing/landing-client").then((m) => m.StatsShowcaseClient),
  {
    ssr: true,
  }
);
const TimerShowcaseClient = dynamic(
  () => import("@/components/features/landing/landing-client").then((m) => m.TimerShowcaseClient),
  {
    ssr: true,
  }
);
const MilestoneShowcaseClient = dynamic(
  () =>
    import("@/components/features/landing/landing-client").then((m) => m.MilestoneShowcaseClient),
  {
    ssr: true,
  }
);
const FinalCtaClient = dynamic(
  () => import("@/components/features/landing/landing-client").then((m) => m.FinalCtaClient),
  {
    ssr: true,
  }
);

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Landing Header Navigation */}
      <LandingHeader />

      {/* 1. HERO SECTION */}
      <HeroClient />

      {/* 2. CORE PHILOSOPHY / ENGINEERING HIGHLIGHTS SECTION */}
      <section id="philosophy" className="border-y border-border/40 bg-muted/30 py-12 font-body">
        <div className="mx-auto max-w-5xl px-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-foreground">Timezone Correct</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Streaks compute based on your current device timezone, completely preventing UTC-boundary streak resets.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-foreground">Optimistic UI</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">All habit check-ins render instantly on screen using local caching, syncing with database blocks in the background.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-foreground">Row-Level Security</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Your check-in logs and personal habit metrics are encrypted and locked down at the database layer.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-foreground">Adaptive Rendering Heuristic</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Heavy WebGL/Three.js particle scenes scale down to static SVG vectors dynamically on lower-spec hardware.</p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <div id="how-it-works">
        <HowItWorksClient />
      </div>

      {/* 4. FEATURE: STREAK ORB SHOWCASE */}
      <div id="features" className="space-y-0">
        <OrbShowcaseClient />
        <StatsShowcaseClient />
        <TimerShowcaseClient />
        <MilestoneShowcaseClient />
      </div>

      {/* 8. ACCESSIBILITY & PERFORMANCE CALLOUT */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center font-body md:text-left">
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-border/80 bg-card/40 p-8 shadow-sm md:flex-row md:p-12">
          <div className="max-w-xl space-y-4">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Accessible. Fast. Built with Respect.
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              We believe great design shouldn't demand high-end specs or compromise access. Cadence
              features full keyboard accessibility, semantic HTML structures, and WCAG AA color
              palettes. If you prefer reduced motion or run on a low-end device, our capability
              guards automatically switch heavy 3D canvases to lightweight static vectors.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-4">
            <span className="rounded-full border border-border bg-muted px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              ♿ WCAG AA Colors
            </span>
            <span className="rounded-full border border-border bg-muted px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              ⚡ Zero CLS
            </span>
            <span className="rounded-full border border-border bg-muted px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              🏃 Motion Guarded
            </span>
          </div>
        </div>
      </section>

      {/* 9. PRICING & ROADMAP OPEN SOURCE SECTION */}
      <section id="pricing" className="border-y border-border/60 bg-muted/30 py-20 text-center font-body">
        <div className="mx-auto max-w-2xl space-y-6 px-4">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            Free & Open Source
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Cadence is a fully open-source habit forming platform. There are no paywalls,
            subscriptions, or intrusive trackers. View our design, submit code contributions, or
            check out our architecture directly on GitHub.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a
              href="https://github.com/x0911/cadence"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/80"
            >
              <span>View Repository on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA & FOOTER */}
      <section className="mx-auto max-w-2xl space-y-16 px-4 py-24 text-center font-body">
        <div className="space-y-6">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            Ready to Build Consistency?
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Create your account today, establish rituals, set focus durations, and watch your
            progress take visual form.
          </p>
          <FinalCtaClient />
        </div>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent" />
            <span className="font-heading font-bold text-foreground">Cadence</span>
            <span>© {new Date().getFullYear()}. MIT License.</span>
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/x0911/cadence"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <Link href="/login" className="hover:text-foreground">
              Dashboard Demo
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
