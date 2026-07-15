import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Dashboard page stub — full implementation in Phase 3.
 * Middleware ensures only authenticated users reach this route.
 */
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        Dashboard
      </h1>
      <p className="mt-2 font-body text-muted-foreground">
        Your habits and streak orb will appear here — full implementation in Phase 3.
      </p>
    </div>
  );
}
