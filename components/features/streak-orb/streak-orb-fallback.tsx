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

  return (
    <div className="orb-container flex flex-col items-center justify-center gap-3">
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
