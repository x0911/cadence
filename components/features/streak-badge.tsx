/** components/features/streak-badge.tsx — stub for Phase 3 */
export function StreakBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 font-body text-xs font-semibold text-accent">
      🔥 {count}
    </span>
  );
}
