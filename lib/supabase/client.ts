// Browser-side Supabase client — singleton for client components
// Uses the new NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (replaces legacy anon key).
// Publishable keys are NOT JWTs — they are sent on the `apikey` header only.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
