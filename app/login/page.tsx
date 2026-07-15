import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

/**
 * Login page stub — full implementation in Phase 2.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 font-body text-muted-foreground">
          Sign in to Cadence — full auth coming in Phase 2.
        </p>
      </div>
    </main>
  );
}
