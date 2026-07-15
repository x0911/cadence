// supabase/functions/weekly-summary/index.ts
// Full implementation in Phase 7 — sends weekly habit summary emails via Resend
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (_req: Request) => {
  // TODO Phase 7: query per-user weekly stats and call Resend API
  return new Response(
    JSON.stringify({ message: "weekly-summary stub — Phase 7" }),
    { headers: { "Content-Type": "application/json" } }
  );
});
