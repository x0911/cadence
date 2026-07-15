/** components/features/focus-timer.tsx — stub for Phase 4 */
export function FocusTimer({ durationSeconds }: { durationSeconds: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="font-body text-sm text-muted-foreground">
        Focus timer ({durationSeconds}s) — Phase 4
      </p>
    </div>
  );
}
