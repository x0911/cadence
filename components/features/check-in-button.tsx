/** components/features/check-in-button.tsx — stub for Phase 3 */
"use client";
export function CheckInButton({ label = "Check In" }: { label?: string }) {
  return (
    <button className="rounded-lg bg-accent px-4 py-2 font-body font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-95">
      {label}
    </button>
  );
}
