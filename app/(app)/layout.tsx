/**
 * (app) group layout — authenticated routes
 * Middleware in middleware.ts handles auth redirect; this layout
 * will add the app shell (nav, sidebar) in later phases.
 */
import { MilestoneCelebration } from "@/components/features/milestone-celebration";
import { ConfirmationDialog } from "@/components/features/confirmation-dialog";
import { HabitDialog } from "@/components/features/habit-dialog";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
      <MilestoneCelebration />
      <ConfirmationDialog />
      <HabitDialog />
    </div>
  );
}
