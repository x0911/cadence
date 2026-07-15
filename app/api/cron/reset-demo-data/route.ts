/**
 * /api/cron/reset-demo-data — truncates and reseeds the guest demo account
 * Protected by CRON_SECRET header. Full implementation in Phase 7.
 */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO Phase 7: invoke Supabase Edge Function reset-demo-data
  return NextResponse.json({ message: "reset-demo-data stub — Phase 7" });
}
