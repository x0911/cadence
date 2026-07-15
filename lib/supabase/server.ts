// Server-side Supabase client for Server Components, Route Handlers, Server Actions.
//
// TWO clients are exported:
//   createClient()      — uses the publishable key + user's cookie session.
//                         Suitable for all RLS-scoped data reads and writes.
//   createAdminClient() — uses SUPABASE_SECRET_KEY (elevated privilege, no RLS).
//                         Only use for server-side admin operations (e.g. cron jobs,
//                         seeding demo data). Never call from client components.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/** RLS-scoped server client — uses the publishable key + session cookies */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  );
}

/**
 * Elevated-privilege admin client — uses SUPABASE_SECRET_KEY.
 * Bypasses RLS. Only use in trusted server-only contexts (cron routes, seeding).
 * NEVER pass this client or its results to client components.
 */
export function createAdminClient() {
  // Admin client does not use cookie-based sessions — it uses the secret key directly.
  // We use createServerClient without cookie handlers for simplicity; this client
  // is only ever used for server-side privileged operations.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}
