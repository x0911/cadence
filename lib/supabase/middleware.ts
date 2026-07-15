/**
 * lib/supabase/middleware.ts — Supabase auth session refresh + route protection
 *
 * Key design decisions for the new publishable/secret key system:
 *
 * 1. Route-protection auth check uses `auth.getClaims()` instead of `auth.getUser()`.
 *    - getClaims() verifies the session JWT **locally** using the JWKS signing keys
 *      (fetched once and cached by the SDK), avoiding a round-trip to the Auth server
 *      on every middleware invocation.
 *    - It falls back to getUser() automatically for HS256 (symmetric) JWTs or if
 *      WebCrypto is unavailable, so it's safe to use unconditionally.
 *    - Returns `data.claims` (the JWT payload) and `data.claims.sub` as the user ID.
 *
 * 2. SUPABASE_JWKS_URL is available for custom local JWT verification outside the SDK
 *    (e.g. in Edge Functions or non-Supabase middleware contexts) via `jose`.
 *    The helper `verifyJwtWithJwks()` is exported for reuse in Phase 7 Edge Functions.
 *
 * 3. The publishable key is NOT a JWT — it is sent only on the `apikey` header by the
 *    SDK. No manual Authorization header construction is needed here.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createRemoteJWKSet } from "jose/jwks/remote";
import { jwtVerify } from "jose/jwt/verify";
import type { JWTPayload } from "jose";
import type { Database } from "./types";

// ── JWKS remote key set (lazily initialised, cached for the process lifetime) ──
let _remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getRemoteJwks() {
  if (!_remoteJwks && process.env.SUPABASE_JWKS_URL) {
    _remoteJwks = createRemoteJWKSet(new URL(process.env.SUPABASE_JWKS_URL));
  }
  return _remoteJwks;
}

/**
 * Verify a raw JWT string using the project's JWKS endpoint.
 * Use this wherever you need custom local verification outside the SDK's own handling
 * (e.g. in Edge Functions, CRON route guards, or when you have a raw token string).
 *
 * Returns the JWT payload on success, or null on failure/misconfiguration.
 */
export async function verifyJwtWithJwks(token: string): Promise<JWTPayload | null> {
  const jwks = getRemoteJwks();
  if (!jwks) return null;
  try {
    const { payload } = await jwtVerify(token, jwks);
    return payload;
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── Auth check via getClaims() — local JWT verification, no Auth server round-trip ──
  //
  // getClaims() fetches the JWKS from Supabase once (cached), then verifies the JWT
  // signature locally on every call. Much faster than getUser() for route protection.
  //
  // IMPORTANT: do not add any logic between createServerClient and getClaims()
  // (same constraint as with getUser()) to avoid session refresh races.
  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const isAuthenticated = !claimsError && claimsData?.claims?.sub != null;

  // Protect (app) routes — redirect unauthenticated users to /login
  const isAppRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/habits") ||
    request.nextUrl.pathname.startsWith("/settings");

  if (isAppRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect already-authenticated users away from login
  if (request.nextUrl.pathname === "/login" && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
