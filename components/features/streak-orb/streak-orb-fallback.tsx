/**
 * components/features/streak-orb/streak-orb-fallback.tsx
 *
 * Static SVG fallback for the 3D Streak Orb.
 * Shown when:
 *   - prefers-reduced-motion is set
 *   - WebGL is unavailable
 *   - device is low-end (lib/device.ts heuristics)
 *   - user has disabled 3D visuals in Settings
 *
 * Per §6.6 and §9: always includes a screen-reader-only text summary.
 */

import { prefersReducedMotion } from "@/lib/device";

export interface StreakOrbFallbackProps {
  /** 0–3: dormant, building, established, strong */
  strengthLevel: 0 | 1 | 2 | 3;
  maxStreak: number;
  activeHabitsCount: number;
}

const STRENGTH_LABELS = ["Dormant", "Building", "Established", "Strong"] as const;

const STRENGTH_COLORS: Record<number, string> = {
  0: "#94A3B8", // muted
  1: "#34D399", // soft green
  2: "#059669", // accent
  3: "#047857", // deep green
};

export function StreakOrbFallback({
  strengthLevel,
  maxStreak,
  activeHabitsCount,
}: StreakOrbFallbackProps) {
  const color = STRENGTH_COLORS[strengthLevel];
  const label = STRENGTH_LABELS[strengthLevel];
  const size = 80 + strengthLevel * 20; // grows with strength

  const showParticles = !prefersReducedMotion() && strengthLevel > 0;

  return (
    <div className="orb-container relative flex flex-col items-center justify-center gap-3">
      {/* CSS-only ambient particle background */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center h-[160px] w-[160px]">
          <div
            className="absolute h-2.5 w-2.5 rounded-full opacity-40 animate-pulse"
            style={{
              backgroundColor: color,
              transform: 'translate(-45px, -45px)',
              animationDuration: '3.5s',
              filter: 'blur(0.5px)',
            }}
          />
          <div
            className="absolute h-3 w-3 rounded-full opacity-30 animate-pulse"
            style={{
              backgroundColor: color,
              transform: 'translate(45px, -35px)',
              animationDuration: '4.5s',
              animationDelay: '0.8s',
              filter: 'blur(0.5px)',
            }}
          />
          <div
            className="absolute h-2 w-2 rounded-full opacity-50 animate-pulse"
            style={{
              backgroundColor: color,
              transform: 'translate(-35px, 45px)',
              animationDuration: '3s',
              animationDelay: '1.5s',
              filter: 'blur(0.5px)',
            }}
          />
          <div
            className="absolute h-3.5 w-3.5 rounded-full opacity-20 animate-pulse"
            style={{
              backgroundColor: color,
              transform: 'translate(35px, 40px)',
              animationDuration: '5s',
              animationDelay: '2.2s',
              filter: 'blur(1px)',
            }}
          />
        </div>
      )}

      {/* Static SVG orb */}
      <svg
        width={size + 40}
        height={size + 40}
        viewBox="0 0 160 160"
        aria-hidden="true"
        className="drop-shadow-md"
      >
        <defs>
          <radialGradient id="orb-gradient" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="60" fill={`url(#orb-gradient)`} />
        {strengthLevel >= 2 && (
          <circle
            cx="80"
            cy="80"
            r="65"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeOpacity="0.3"
          />
        )}
        {strengthLevel >= 3 && (
          <circle
            cx="80"
            cy="80"
            r="72"
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeOpacity="0.15"
          />
        )}
      </svg>

      {/* Streak strength label */}
      <p className="font-heading text-sm font-semibold" style={{ color }}>
        {label}
      </p>

      {/* Screen-reader-only summary (§9 accessibility requirement) */}
      <span className="sr-only">
        Overall streak strength: {label} — {activeHabitsCount} active habit
        {activeHabitsCount !== 1 ? "s" : ""}, best streak {maxStreak} day
        {maxStreak !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
