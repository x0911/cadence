/**
 * components/features/streak-orb/streak-orb.tsx
 *
 * Entry point for the Streak Orb feature.
 * Uses next/dynamic with ssr:false so Three.js NEVER enters the server bundle.
 * Lazy-mounts via IntersectionObserver (mounts Canvas only when scrolled into view).
 * Falls back to StreakOrbFallback when device/motion guards fail.
 *
 * Full implementation in Phase 6.
 */
"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { should3DRender } from "@/lib/device";
import type { StreakOrbFallbackProps } from "./streak-orb-fallback";
import { StreakOrbFallback } from "./streak-orb-fallback";

// Dynamically imported with ssr:false — Three.js never ships in server bundle
const StreakOrbScene = dynamic(
  () => import("./streak-orb-scene").then((m) => ({ default: m.StreakOrbScene })),
  { ssr: false, loading: () => <StreakOrbFallback strengthLevel={0} maxStreak={0} activeHabitsCount={0} /> }
);

interface StreakOrbProps extends StreakOrbFallbackProps {
  visuals3dEnabled?: boolean;
}

export function StreakOrb({
  strengthLevel,
  maxStreak,
  activeHabitsCount,
  visuals3dEnabled = true,
}: StreakOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [can3D] = useState(() => should3DRender(visuals3dEnabled));

  // Lazy-mount on viewport intersection (§6.2)
  useEffect(() => {
    if (!can3D) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [can3D]);

  return (
    // Fixed-aspect container prevents CLS while canvas lazy-mounts (§8)
    <div ref={containerRef} className="orb-container w-48 h-48">
      {can3D && isInView ? (
        <StreakOrbScene
          strengthLevel={strengthLevel}
          maxStreak={maxStreak}
          activeHabitsCount={activeHabitsCount}
        />
      ) : (
        <StreakOrbFallback
          strengthLevel={strengthLevel}
          maxStreak={maxStreak}
          activeHabitsCount={activeHabitsCount}
        />
      )}
    </div>
  );
}
