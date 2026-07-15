// supabase/functions/reset-demo-data/index.ts
// Full implementation in Phase 7 — truncates and reseeds the guest demo account
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (_req: Request) => {
  // TODO Phase 7: truncate guest account habits/check_ins, reseed demo data
  return new Response(
    JSON.stringify({ message: "reset-demo-data stub — Phase 7" }),
    { headers: { "Content-Type": "application/json" } }
  );
});
