/**
 * Marketing group layout — no auth required
 * Static/server-rendered for fast LCP (§8)
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
