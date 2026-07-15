import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadence — Build Habits That Last",
  description:
    "Cadence turns habit-building into a game. Track streaks, watch your 3D orb grow, and celebrate milestones. Start your first habit in seconds.",
};

/**
 * Landing page — fully static, server-rendered, zero client dependencies.
 * Full implementation in Phase 8. This stub ensures the build passes in Phase 0.
 */
export default function MarketingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="font-heading text-5xl font-bold text-foreground">
          Cadence
        </h1>
        <p className="mt-4 font-body text-lg text-muted-foreground">
          Build habits that last. Track streaks. Celebrate milestones.
        </p>
        <a
          href="/login"
          className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 font-body font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Get started free →
        </a>
      </div>
    </main>
  );
}
