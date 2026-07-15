"use client";

import { useEffect, useState } from "react";
import CountUp from "@/components/react-bits/text/CountUp";
import { prefersReducedMotion } from "@/lib/device";

export function StreakBadge({ count }: { count: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const showAnimation = mounted && !prefersReducedMotion();

  return (
    <span className="bg-accent/10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-xs font-semibold text-accent">
      🔥{" "}
      {showAnimation ? (
        <CountUp to={count} from={0} duration={0.8} />
      ) : (
        count
      )}
    </span>
  );
}
