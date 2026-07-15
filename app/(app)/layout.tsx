/**
 * (app) group layout — authenticated routes
 * Middleware in middleware.ts handles auth redirect; this layout
 * will add the app shell (nav, sidebar) in later phases.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* App shell nav goes here in Phase 2 */}
      <main>{children}</main>
    </div>
  );
}
