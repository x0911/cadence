import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

/**
 * Settings page stub — full implementation in Phase 9.
 */
export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-foreground">
        Settings
      </h1>
      <p className="mt-2 font-body text-muted-foreground">
        Profile, timezone, and 3D visuals toggle — coming in Phase 9.
      </p>
    </div>
  );
}
